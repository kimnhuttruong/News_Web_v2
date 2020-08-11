const express = require("express");
const userModel = require("../models/user.model");
const newpaperModel = require("../models/newspaper.model");
const categoryModel = require("../models/category.model");
const commentModel = require("../models/comment.model");
const statusModel = require("../models/status.model");
const imageModel = require("../models/images.model");
const { compareSync } = require("bcrypt-nodejs");
const router = express.Router();
const bodyParser = require("body-parser");
var multer = require('multer');
const newspaperModel = require("../models/newspaper.model");
const restrict = require('../middlewares/auth.mdw');
var upload = multer({ dest: 'public/uploads' });
const topicModel = require("../models/topic.model");
const tagModel = require("../models/tag.model");
const config = require('../config/default.json')
const tag_newspaperModel = require("../models/tag_newspaper.model");
//const { copy, delete } = require("./_admin.route");


router.get("/profile", restrict, async function (req, res) {
  var user = await userModel.single_id(req.session.authUser['id']);
  res.render("vwAccount/writer/profile", {
    info: user[0],
    layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
    username: user[0]['username'],
    img: user[0]['img'],
  });
});


router.get("/edituser", restrict, async function (req, res) {
  let info = await userModel.single_id(req.session.authUser['id']);
  if (!isNaN(Date.parse(info[0]['time_premium']))) {
    var time_premium = new Date(info[0]['time_premium']);
  }
  else
    var time_premium = new Date('01/01/1970-00:00:00 UTC');
  time_premium.setTime(time_premium.getTime() + 7 * 60 * 60 * 1000);
  info[0]['time_premium'] = time_premium.toISOString().replace("Z", "");

  if (!isNaN(Date.parse(info[0]['birthday']))) {
    var birthday = new Date(info[0]['birthday']);
  }
  else
    var birthday = new Date('01/01/1970-00:00:00 UTC');
  birthday.setTime(birthday.getTime() + 7 * 60 * 60 * 1000);
  info[0]['birthday'] = birthday.toISOString().replace("Z", "");
  res.render("vwAccount/writer/profile_edit", {
    info: info[0],
    layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
    username: info[0]['username'],
    img: info[0]['img'],
  });
});
router.post("/edituser", restrict, async function (req, res) {
  const list = await userModel.single_id(req.body['id']);
  const data = req.body;
  if (req.files != null) {
    let image = req.files.img;
    // Use the mv() method to place the file somewhere on your server
    urlAvatar = './public/uploads/' + req.body['email'] + "_" + image.name;
    image.mv(urlAvatar);
    req.body.img = urlAvatar.replace("./", "http://localhost:3000/");
  }
  else
    req.body.img = list[0]['img'];
  const insert = userModel.patch(req.body);

  var userupdate = await userModel.single_id(req.session.authUser['id']);
  userupdate[0]['password'] = null;
  req.session.isAuthenticated = true;
  req.session.authUser = userupdate[0];

  res.redirect('/account/writer');
  return;
});

router.get("/", restrict, async function (req, res) {
  var user = await userModel.single_id(req.session.authUser['id']);
  var x = await userModel.totalnew("1");
  var y = await userModel.maxview("1")[0];
  var z = await userModel.totalcomment("1")[0];

  res.render("vwAccount/writer/profile", {
    layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
    view: y,
    comment: z,
    new: x,
    info: user[0],
    username: user[0]['username'],
    img: user[0]['img'],
  });
});
// router.get("/view/list", async function (req, res) {
//   let list = await newpaperModel.byUser(req.session.authUser.id);
//   res.render("vwAccount/writer/view", {
//     layout: 'writer_dashboard',
//     list: list,
router.get("/news", restrict, async function (req, res) {
  origin = req.originalUrl;
    var statusid = parseInt(req.query.statusid) || -1;
    var statuses = await statusModel.all();
    
    origin = origin.replace("&page=" + req.query.page, "");
  var user = await userModel.single_id(req.session.authUser['id']);
  // let list = await newpaperModel.lengthview(req.session.authUser['id']);
  lengthListUSer = await newpaperModel.lengthview(req.session.authUser['id'],statusid);

  length = lengthListUSer[0]['count(*)'];

  length = length / 10;
  var page = parseInt(req.query.page) || 1;
  const data = await newpaperModel.view(req.session.authUser['id'],statusid, 10 * (page - 1), 10);

  prev = ""; next = "";
  if (page <= 1)
    prev = { css: "disabled", onclick: 'return false;' };
  if (page >= Math.round(length))
    next = { css: "disabled", onclick: 'return false;' };
  pages = [];
  if (length <= 5) {
    for (i = 1; i <= length + 1; i++) {
      if (i == page)
        pages.push({ index: i, active: "active" });
      else
        pages.push({ index: i, active: "" });
    }
  } else {
    if (page <= 5) {
      for (i = 1; i <= 5; i++) {
        if (i == page)
          pages.push({ index: i, active: "active" });
        else
          pages.push({ index: i, active: "" });
      }
    }
    else if (page > parseInt(length + 1 - 5)) {
      for (i = Math.round(length + 1 - 4); i <= parseInt(length); i++) {
        if (i == page)
          pages.push({ index: i, active: "active" });
        else
          pages.push({ index: i, active: "" });
      }
    } else {
      for (i = page - 2; i <= page + 2; i++) {
        if (i == page)
          pages.push({ index: i, active: "active" });
        else
          pages.push({ index: i, active: "" });
      }
    }
  }
  res.render("vwAccount/writer/view", {
    layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
    list: data, statusid, statuses,
    // listpage: listpage,
    // nextpage: page + 1,
    // prepage: page - 1,
    pages,
    page, prev, next, last: Math.round(length),
    username: user[0]['username'],
    img: user[0]['img'],
  });

});

router.get("/view/preview/:id", restrict, async function (req, res) {
  const id = +req.params.id || -1;
  const rows = await newspaperModel.single(id);
  const comments = await commentModel.byNewspaper(id);
  const sum_comment = await commentModel.countComment(id);
  const topic_news = await newspaperModel.randomtop5();
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const listCategory = await categoryModel.all();
  const listTopic = await topicModel.all();
  const listtag = await tag_newspaperModel.all(id);
  const relatedlisttag = await tag_newspaperModel.alltags();

  nametopic = await topicModel.single_id(rows[0]['topicid']);
  namecat = await categoryModel.single_id(nametopic[0]['catid']);

  let arrCat = [];
  arrCat = await listCategory;
  for (cat in arrCat) {
    topics = await topicModel.single_catid(arrCat[cat]['id']);
    arrCat[cat]['topic'] = topics;

  }

  if (req.session.authUser) {
    if (req.session.authUser['img'] != null) {
      lenURL = req.session.authUser['img'].split("//");
      if (lenURL.length < 2) {
        isURL = false;
      }
    }
  }
  res.render('vwAccount/writer/newspaper_preview', {
    new: rows[0],
    topic_news,
    comments: comments,
    id, listtag, relatedlisttag,
    login,
    nametopic: nametopic[0]['name'], namecat: namecat[0]['name'],
    user: req.session.authUser,
    arrCat
  });
});



router.get("/news/update/:id", restrict, async function (req, res) {
  var user = await userModel.single_id(req.session.authUser['id']);
  const idUser = req.session.authUser.id;
  const idNews = +req.params.id || -1;
  role = [];
  if (req.session.authUser.roleid == 1)
    role = ["1"];
  //get data
  var dataNews = await newspaperModel.view_detail(idNews);
  if (!isNaN(Date.parse(dataNews[0]['time']))) {
    var time = new Date(dataNews[0]['time']);
  }
  else
    var time = new Date('01/01/1970-00:00:00 UTC');
  time.setTime(time.getTime() + 7 * 60 * 60 * 1000);
  dataNews[0]['time'] = time.toISOString().replace("Z", "");
  var cats = await categoryModel.all();
  catid = -1;
  var topic = await topicModel.all();
  for (i = 0; i < cats.length; i++) {
    cats[i]["topic"] = await topicModel.single_catid(cats[i]["id"]);
    for (j = 0; j < cats[i]["topic"].length; j++) {
      if (cats[i]["topic"][j]['id'] == dataNews[0]['topicid'])
        catid = cats[i]["id"];
    }
  }
  const images = await imageModel.byUser(idUser);
  const tags = await tag_newspaperModel.byNews(idNews);
  var nameTags = [];

  if (tags.lenght != 0) {

    for (var i in tags) {
      nameTags.push(tags[i]['name']);
    }
  }
  res.render("vwAccount/writer/newspaper_update",
    {
      nameTags, cats, catid, topic, role,
      layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
      images,
      dataNews: dataNews[0],
      idNews, img: user[0]['img'],
      username: user[0]['username'],
    });
});

router.post("/news/update/:id", restrict, upload.single('avatar'), async function (req, res) {
  
  const idUser = req.session.authUser.id;
  const idNews = req.body.id || -1;
  var data = new Object(req.body);
  var tagsCha = Array.from(data.tag);


  delete data.tag;
  if (data.ispremium !== '0')
    data.ispremium = 1;
  else
    data.ispremium = 0;
  if (req.session.authUser.id != 1) {
    data.time = new Date(Date.now());
    data.statusid = 4;
  }
  data.writerid = idUser;

  //update data
  await newspaperModel.patch(data);


  //compute tag
  var newTags = [];
  var temp = '';
  for (var c of tagsCha) {
    if (c !== ',') {
      temp += c;
    }
    else {
      newTags.push(temp);
      temp = '';
    }
  };
  newTags.push(temp);

  //get old relationship between news and tag
  const oldTags = await tag_newspaperModel.byNews(idNews);
  var nameTags = [];
  //delete old relation not exist
  if (oldTags.lenght != 0) {
    for (var tag of oldTags) {
      if (!newTags.includes(tag.name))
        await tag_newspaperModel.delOldRelation(tag.id, idNews);

    }
    for (var tag of newTags) {
      if (!oldTags.includes(tag.name)) {
        var isExis = await tagModel.singleByTagName(tag);

        if (isExis == null) {
          //insert tag table
          var tagInput = {};
          tagInput.name = tag;

          await tagModel.add(tagInput);

          //insert tag_newspaper table
          var tn = {};
          tn.tagid = (await tagModel.idByName(tag))[0].id;
          tn.newspaperid = idNews;
          await tag_newspaperModel.add(tn);
        };
      }
    }
  }
  //check tag
  req.session.newsAdd = true;
  req.session.newsId = idNews;
  res.redirect('/account/writer/view/newspaper/upload_avatar');

});

router.post("/view/newspaper/add", restrict, upload.single('avatar'), async function (req, res) {
  const idUser = req.session.authUser.id;

  var data = new Object(req.body);
  var tagsCha = Array.from(data.tag);

  delete data.tag;
  if (data.ispremium !== '0')
    data.ispremium = 1;
  else
    data.ispremium = 0;
  data.time = new Date(Date.now());
  data.statusid = 4;
  data.writerid = idUser;

  await newspaperModel.add(data);

  //get id news of user
  const idNews = await newspaperModel.getIdLast(idUser);

  //compute tag
  var tags = [];
  var temp = '';
  for (var c of tagsCha) {
    if (c !== ',') {
      temp += c;
    }
    else {
      tags.push(temp);
      temp = '';
    }
  };
  tags.push(temp);


  //check tag
  for (var tag of tags) {
    var isExis = await tagModel.singleByTagName(tag);

    if (isExis == null) {
      //insert tag table
      var tagInput = {};
      tagInput.name = tag;

      await tagModel.add(tagInput);
      //insert tag_newspaper table
      var tn = {};
      tn.tagid = (await tagModel.idByName(tag))[0].id;
      tn.newspaperid = idNews[0].id;
      await tag_newspaperModel.add(tn);
    };
  };
  req.session.newsAdd = true;
  req.session.newsId = idNews[0].id;
  res.redirect('./upload_avatar');
});


router.get("/view/newspaper/add", restrict, async function (req, res) {
  var user = await userModel.single_id(req.session.authUser['id']);
  var cats = await categoryModel.all();
  role = [];
  if (req.session.authUser.roleid == 1)
    role = ['1'];
  for (i = 0; i < cats.length; i++) {
    cats[i]["topic"] = await topicModel.single_catid(cats[i]["id"]);
  }
  var topic = await topicModel.all();
  const images = await imageModel.byUser(req.session.authUser['id']);
  res.render("vwAccount/writer/newspaper_add", {
    layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
    topic, role,
    images, cats,
    empty: images.lenght == 0,
    img: user[0]['img'],
    username: user[0]['username'],
  });
});

router.get("/view/newspaper/upload_img", restrict, async function (req, res) {
  const idUser = req.session.authUser.id;
  const images = await imageModel.byUser(idUser);
  res.render("vwAccount/writer/upload_img",
    {
      layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
      images,
      empty: images.lenght == 0,
    }
  );
});

router.post('/view/newspaper/upload_img', restrict, async function (req, res) {
  //.....
  const idUser = req.session.authUser.id;
  let _fileName = '';
  const storage = multer.diskStorage({
    filename: async function (req, file, cb) {

      var pre = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
      var expand = file.originalname.substring(file.originalname.lastIndexOf('.'));
      _fileName = pre + Date.now().toString() + expand;
      cb(null, _fileName);
      const data = {};
      data['name'] = "" + _fileName;
      data.idUser = idUser;
      const upload_img = await imageModel.add(data);

    },
    destination(req, file, cb) {
      cb(null, './public/uploads');
    }
  });
  const upload = multer({ storage });
  upload.array('fuMain', 3)(req, res, async function (err) {
    if (!err) {
      //get count image

      const images = await imageModel.byUser(idUser);

      res.render('vwAccount/writer/upload_img', { layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard', images, });
    }
    else res.send(err);
  })
})

router.get('/view/newspaper/upload_avatar', restrict, async function (req, res) {
  if (req.session.newsAdd) {
    news= await newspaperModel.single_id(req.session.newsId);
    console.log(req.session);
    res.render("vwAccount/writer/upload_avatar",
      {
        layout: false,
        news:news[0]
      }
    );
  }
  else {
    res.render('500');
  }
});

router.post('/view/newspaper/upload_avatar', restrict, async function (req, res) {

  if (req.session.newsAdd) {

    const idUser = req.session.authUser.id;
    const idNews = req.session.newsId;
    let _fileName = '';
    const storage = multer.diskStorage({
      filename: async function (req, file, cb) {

        var pre = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
        var expand = file.originalname.substring(file.originalname.lastIndexOf('.'));
        _fileName = pre + Date.now().toString() + expand;
        cb(null, _fileName);
        const data = {};
        data['name'] = _fileName;
        data.idUser = idUser;

        //insert image into data table images
        await imageModel.add(data);
        console.log(idNews);
        //update id avatar into newspaper;
        await newspaperModel.updateAvatar(idNews, "/public/uploads/"+_fileName);

      },

      destination(req, file, cb) {
        cb(null, './public/uploads');
      }
    });
    const upload = multer({ storage });
    upload.array('fuMain', 3)(req, res, async function (err) {
      if (!err) {
        //get count image
        res.redirect('/account/writer/view/newspaper/upload_avatarBigsize');
      }
      else res.send(err);
    })
  }
  else
    res.render('500');
});

router.get('/view/newspaper/upload_avatarBigsize', restrict, async function (req, res) {
  const idNews = +req.session.idNews || -1;
  news= await newspaperModel.single_id(req.session.newsId);
  data = "writer";
  if (req.session.authUser.roleid == 1)
    data = "admin";
  res.render("vwAccount/writer/upload_avatarBigsize",
    {
      data,layout:false,news:news[0]
    }
  );
  // res.send(role);
})

router.post('/view/newspaper/upload_avatarBigsize', restrict, async function (req, res) {
  if (req.session.newsAdd) {
    const idNews = req.session.newsId;
    const idUser = req.session.authUser.id;

    let _fileName = '';
    const storage = multer.diskStorage({
      filename: async function (req, file, cb) {

        var pre = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
        var expand = file.originalname.substring(file.originalname.lastIndexOf('.'));
        _fileName = pre + Date.now().toString() + expand;
        cb(null, _fileName);
        const data = {};
        data['name'] = "" + _fileName;
        data.idUser = idUser;
        //insert image into data table images
        await imageModel.add(data);

        //update id avatar into newspaper;
        await newspaperModel.updateAvatarBigSize(idNews, '/public/uploads/' + _fileName);

      },

      destination(req, file, cb) {
        cb(null, './public/uploads');
      }
    });
    const upload = multer({ storage });
    upload.array('fuMain', 3)(req, res, async function (err) {
      if (!err) {
        if (req.session.authUser.roleid != 1)
          res.render('vwAccount/admin/sendDraft_successful');
        else
          res.render('vwAccount/writer/sendDraft_successful');
      }
      else res.send(err);
    });
    req.session.newsId = -1;
    req.session.newsAdd = false;
  }
  else
    res.render('500');

});
router.get('/news/delete/:id', restrict, async function (req, res) {

  id = (req.params.id);
  const data = await newspaperModel.del(id);
  if (req.session.authUser.roleid != 1)
    res.redirect('/account/writer/news');
  else
    res.redirect('/account/admin/news');
  return;

})


module.exports = router;
