const express = require("express");
const restrict = require('../middlewares/auth.mdw');
const userModel = require("../models/user.model");
const categoryModel = require("../models/category.model");
const newpaperModel = require("../models/newspaper.model");
const { compareSync } = require("bcrypt-nodejs");
const router = express.Router();
const bodyParser = require("body-parser");
const tagModel = require("../models/tag.model");
const topicModel = require("../models/topic.model");
const tag_newspaperModel = require("../models/tag_newspaper.model")

router.get("/", restrict, async function (req, res) {
  const list = await userModel.single_id(req.session.authUser['id']);
  res.render("vwAccount/editor/profile", {
    info: list[0],
    layout: 'editor_dashboard',
    username: list[0]['username'],
    img: list[0]['img'],
  });
});
router.get("/profile", restrict, async function (req, res) {
  const list = await userModel.single_id(req.session.authUser['id']);
  res.render("vwAccount/editor/profile", {
    info: list[0],
    layout: 'editor_dashboard',
    username: list[0]['username'],
    img: list[0]['img'],
  });
});
router.get('/edituser', restrict, async function (req, res) {
  const list = await userModel.single_id(req.session.authUser['id']);
  if (!isNaN(Date.parse(list[0]['time_premium']))) {
    var time_premium = new Date(list[0]['time_premium']);
  }
  else
    var time_premium = new Date('01/01/1970-00:00:00 UTC');
  time_premium.setTime(time_premium.getTime() + 7 * 60 * 60 * 1000);
  list[0]['time_premium'] = time_premium.toISOString().replace("Z", "");

  if (!isNaN(Date.parse(list[0]['birthday']))) {
    var birthday = new Date(list[0]['birthday']);
  }
  else
    var birthday = new Date('01/01/1970-00:00:00 UTC');
  birthday.setTime(birthday.getTime() + 7 * 60 * 60 * 1000);
  list[0]['birthday'] = birthday.toISOString().replace("Z", "");

  res.render("vwAccount/editor/edit_profile", {
    layout: 'editor_dashboard',
    list,
    username: list[0]['username'],
    img: list[0]['img']
  });
  return;
})
const fileUpload = require('express-fileupload');
router.use(fileUpload());
router.post('/edituser', restrict, async function (req, res) {

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

  res.redirect('/account/editor');
  return;

})
// router.get("/profile/update?",restrict, async function (req, res) {
//   //if (req.session.isAuthenticated) {
//   let info = await userModel.single_id(req.query.id);
//   res.render("vwAccount/editor/profile_edit", {
//     info: info[0],
//     layout: false,
//   });
// });
// router.post("/profile/update",restrict, async function (req, res) {
//   //if (req.session.isAuthenticated) {
//   req.body.img = req.file.path.split('\\').slice(1).join('/');
//   let result = userModel.patch(req.body);
//   if (result) res.redirect("../profile");
//   else res.render("500");
// });


router.get("/news", restrict, async function (req, res) {
  var catid = parseInt(req.query.catid) || -1;
  var topicid = parseInt(req.query.topicid) || -1;
  var topics = await topicModel.single_catid(catid);
  origin = req.originalUrl;
    if(origin=='/account/editor/news')
        origin="/account/editor/news"+"?";
  origin = origin.replace("&page=" + req.query.page, "");
  var cats = await categoryModel.all_editor(req.session.authUser['id']);
  for (i = 0; i < cats.length; i++) {
      
      cats[i]["topic"] = await topicModel.single_catid(cats[i]["id"]);
  }
  // let list = await newpaperModel.view_by_tags("abc");
  const listuser = await userModel.single_id(req.session.authUser['id']);
  var page = parseInt(req.query.page) || 1;
  var perPage = 10;
  var start = page * perPage
  lengthListUSer = await newpaperModel.lengthview_by_task(req.session.authUser['id'],catid, topicid);
  length = lengthListUSer[0]['count(*)'];
  length = length / 10;
  var page = parseInt(req.query.page) || 1;
  const data = await newpaperModel.view_by_task(req.session.authUser['id'],catid, topicid, 10 * (page - 1) );
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


  res.render("vwAccount/editor/view", {
    layout: 'editor_dashboard',
    list: data, cats, origin, topics, topicid, catid,
    username: listuser[0]['username'],
    img: listuser[0]['img'],
    pages,
    page, prev, next, last: Math.round(length)
  });
});
router.get("/news/:id", restrict, async function (req, res) {
  const listuser = await userModel.single_id(req.session.authUser['id']);

  const info = await newpaperModel.view_detail(req.params.id);
  if (!isNaN(Date.parse(info[0]['time']))) {
    var time = new Date(info[0]['time']);
  }
  else
    var time = new Date('01/01/1970-00:00:00 UTC');
    time.setTime(time.getTime() + 7 * 60 * 60 * 1000);
  info[0]['time'] = time.toISOString().replace("Z", "");
  if (info[0].statusid == 3 || info[0].statusid == 4)
    var access = true;
  tags = [];
  const tag = await tagModel.all(info[0].id);
  for (const key in tag) {

    tags.push(tag[key]);
  }
  info[0].tag = tags
  res.render("vwAccount/editor/newspaper_detail", {
    layout: 'editor_dashboard',
    info: info[0],
    isActive: access,
    username: listuser[0]['username'],
    img: listuser[0]['img']
  });
});

router.get("/news/update/:id", restrict, async function (req, res) {
  const info = await newpaperModel.view_detail(req.params.id);
  var next = false;
  if (info[0].avatar.search('http'))
    next = true;
  //if (req.session.isAuthenticated) {
  res.render("vwAccount/editor/newpaper_update", {
    layout: false,
    info: info[0],
    next
  });
});



router.post("/news/:id", restrict, async function (req, res) {
  req.body.id = (req.params.id);
  if (req.body['ispremium'])
    req.body['ispremium'] = 1;
  // let tags = req.body.tag;
  // tags = tags.trim().split(",");
  // for (const key in tags) {
  //   const kq = await tagModel.add({ name: tags[key] });
  // }
  // for (const key in tags) {

  //   var i = await tagModel.single_id(tags[key]);
  //   for (const key in i) {
  //     var item = { newsparperid: req.body.id, tagid: i[key]['id'] };
  //     var kq = await tag_newspaperModel.add(item);
  //   }
  // }
  // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  req.body.ispremium=req.body.ispremium||0;
  var result = await newpaperModel.patch(req.body);
  // if (result.changedRows == 1)
    res.redirect("../news");
  // else
    // res.render("404");




});


module.exports = router;
