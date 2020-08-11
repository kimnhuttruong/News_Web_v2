const express = require('express');
const router = express.Router();
const config = require('../config/default.json')
const newModel = require('../models/newspaper.model');
const commentModel = require('../models/comment.model');
const categoryModel = require('../models/category.model');
const newspaperModel = require('../models/newspaper.model');
const newsModel = require('../models/newspaper.model');
const topicModel = require('../models/topic.model');
const dob_date = require('date-format');
const multer = require('multer');
const restrict = require('../middlewares/auth.mdw');
const tagModel = require('../models/tag.model');
const tagnewsModel = require('../models/tag_newspaper.model');

router.get('/', async (req, res) => {
  req.query.topic = req.query.topic || -1;
  req.query.cat = req.query.cat || -1;

  const listTopic = await topicModel.all();
  const listCategory = await categoryModel.all();
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const arrCat = [];
  const page = parseInt(req.query.page) || 1;
  namecat = await categoryModel.single_id(req.query.cat || -1);
  nametopic = await topicModel.single_id(req.query.topic || -1);
  nametag = await tagModel.single_id(req.query.tag || -1);
  const listtopnews = await newspaperModel.top10();
  for (var i in listCategory) {
    const Category = {};
    Object.assign(Category, listCategory[i]);
    Category.topic = [];
    Category.idTopic = [];
    //objectCategory[i].topic = 'topic';
    topic = [];
    for (var j in listTopic) {
      if (listCategory[i]['id'] == listTopic[j]['catid']) {
        topic.push(listTopic[j])
      }
    };
    Category.topic = topic;

    arrCat.push({ category: Category });
  };

  var perPage = 10;
  var start = page * perPage;
  var cat = req.query.cat;
  var topic = req.query.topic;
  if (namecat.length > 0) {
    namecat = { name: namecat[0]['name'] + "  >   ", id: namecat[0]['id'] };
  }
  else {
    namecat = "";
  }
  if (nametopic.length > 0) {
    nametopic = { name: nametopic[0]['name'], id: nametopic[0]['id'] };
  }
  // else {
  //   namecat = "";
  //   nametopic = "";
  // }
  if (nametag.length > 0) {
    nametag = "#" + nametag[0]['name'];
  }

  let data = [];
  let tag = '';
  let istag = false;
  if (req.query.tag) {
    tag = req.query.tag;
    istag = true;
    const lengthListUSer = await newsModel.lengthpageByTag(tag);
    datalength = lengthListUSer[0]['count'];
    datalength = datalength / 10;
    data = await newsModel.pageByTag(tag, 10, 10 * (page - 1) + 1);
    prev = ""; next = "";
    if (page <= 1)
      prev = { css: "disabled", onclick: 'return false;' };
    if (page >= Math.round(datalength))
      next = { css: "disabled", onclick: 'return false;' };
    pages = [];
    if (datalength <= 5) {
      for (i = 1; i <= datalength + 1; i++) {
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
      else if (page > parseInt(datalength + 1 - 5)) {
        for (i = Math.round(datalength + 1 - 4); i <= parseInt(datalength); i++) {
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
  }
  //var a='';
  else {

    const lengthListUSer = await newsModel.lengthpageByCat_Topic(req.query.topic, req.query.cat);
    datalength = lengthListUSer[0]['count'];
    datalength = datalength / 10;
    data = await newsModel.pageByCat_Topic(req.query.topic, req.query.cat, 10 * (page - 1), 10);

    prev = ""; next = "";
    if (page <= 1)
      prev = { css: "disabled", onclick: 'return false;' };
    if (page >= Math.round(datalength))
      next = { css: "disabled", onclick: 'return false;' };
    pages = [];

    if (datalength <= 5) {
      for (i = 1; i <= Math.round(datalength + 0.5); i++) {
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
      else if (page > parseInt(datalength + 1 - 5)) {
        for (i = Math.round(datalength + 1 - 4); i <= parseInt(datalength); i++) {
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
  }

  for (const key in data) {
    if (data[key].avatar != null && data[key].avatar.search("uploads") != -1)
      data[key].avatar = "" + data[key].avatar;
    tags = [];

    const tag = await tagModel.all(data[key].id);
    for (const key in tag) {

      tags.push(tag[key]);
    }
    data[key].tags = tags;

  }
  if (istag)
    res.render('catagories_post', {
      login, listtopnews, arrCat, items: data, nametag,
      tag: req.query.tag, namecat, nametopic,
      istag, pages, user: req.session.authUser,
      page, prev, next, last: Math.round(datalength)
    }
    );
  else
    res.render('catagories_post', {
      login, listtopnews, arrCat, items: data,
      cat, namecat, nametopic,
      topic, user: req.session.authUser,
      istag, pages,
      page, prev, next, last: Math.round(datalength)

    }
    );
  return
});
router.get('/detail/:id', restrict, async function (req, res) {

  const id = +req.params.id || -1;
  const rows = await newModel.single(id);
  const comments = await commentModel.byNewspaper(id);
  const sum_comment = await commentModel.countComment(id);
  const topic_news = await newModel.randomtop5();
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const listCategory = await categoryModel.all();
  const listTopic = await topicModel.all();
  const listtag = await tagnewsModel.all(id);
  const relatedlisttag = await tagnewsModel.alltags();

  nametopic = await topicModel.single_id(rows[0]['topicid']);
  namecat = await categoryModel.single_id(nametopic[0]['catid']);
  const rownews = await newModel.single_id(id);
  rownews[0]['view'] = parseInt(rownews[0]['view']) + 1;
  await newModel.patch(rownews[0]);
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
  res.render('vwNewspaper/detail', {
    new: rows[0],
    topic_news,
    comments,comment_length:comments.length,
    id, listtag, relatedlisttag,
    login,
    nametopic: { id: nametopic[0]['id'], name: nametopic[0]['name'] }, namecat: { id: namecat[0]['id'], name: namecat[0]['name'] },
    user: req.session.authUser,
    arrCat
  });
});
router.get('/download/:id',restrict, async function (req, res) {
  // id=1;
  id=req.params.id || -1;
  console.log(id);
  var fs = require('fs');
  var pdf = require('html-pdf');
  var news = await newsModel.single(id);
  console.log(news);
  var html = news[0]["detail"];
  var options = { paginationOffset: 1,       // Override the initial pagination number
  "header": {
    "height": "45mm",
    "contents": '<div style="text-align: center;font-size:35px;font-weight:bold;">'+news[0]["desc"]+'</div>'
  },
  "footer": {
    "height": "28mm",
    "contents": {
      // Any page number is working. 1-based index
      default: '<span style="color: #444;">'+ news[0]["time"]+'</span>/<span>{{pages}}</span>', // fallback value
      
    }
  }, };
  // fs.writeFile('public/pdf/news_' + id + '.pdf');
  // console.log("x"); 
  var filename='news_' + id+'_'+(news[0]["name"]);
  filename=filename.replace(" ","_");
  console.log(filename);
  pdf.create(html, options).toFile('public/pdf/'+filename + '.pdf', function (err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
  res.download('public/pdf/' +filename+'.pdf',function (err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
  // return res.redirect("/newspaper/detail/"+id);

});
//futext search
router.get("/search", async function (req, res) {

  req.query.typeahead = req.query.typeahead || -1;
  const listTopic = await topicModel.all();
  const listCategory = await categoryModel.all();
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const arrCat = [];
  const page = parseInt(req.query.page) || 1;


  const listtopnews = await newspaperModel.top10();
  for (var i in listCategory) {
    const Category = {};
    Object.assign(Category, listCategory[i]);
    Category.topic = [];
    Category.idTopic = [];
    //objectCategory[i].topic = 'topic';
    topic = [];
    for (var j in listTopic) {
      if (listCategory[i]['id'] == listTopic[j]['catid']) {
        topic.push(listTopic[j])
      }
    };
    Category.topic = topic;

    arrCat.push({ category: Category });
  };

  var perPage = 10;
  var start = page * perPage;
  var typeahead = req.query.typeahead;

  let data = [];
  issearch = true;
  const lengthListUSer = await newsModel.lengthfulltextsearchfull(typeahead);
  datalength = lengthListUSer[0]['count(*)'];
  datalength = datalength / 10;
  data = await newsModel.fulltextsearchfull(typeahead, 10, 10 * (page - 1) + 1);
  prev = ""; next = "";
  if (page <= 1)
    prev = { css: "disabled", onclick: 'return false;' };
  if (page >= Math.round(datalength))
    next = { css: "disabled", onclick: 'return false;' };
  pages = [];
  if (datalength <= 5) {
    for (i = 1; i <= datalength + 1; i++) {
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
    else if (page > parseInt(datalength + 1 - 5)) {
      for (i = Math.round(datalength + 1 - 4); i <= parseInt(datalength); i++) {
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

  for (const key in data) {
    if (data[key].avatar != null && data[key].avatar.search("uploads") != -1)
      data[key].avatar = + data[key].avatar;
    tags = [];

    const tag = await tagModel.all(data[key].id);
    for (const key in tag) {

      tags.push(tag[key]);
    }
    data[key].tags = tags;

  }
  res.render('catagories_post', {
    login, listtopnews, arrCat, items: data, nametag: typeahead,
    tag: typeahead,
    issearch, pages, user: req.session.authUser,
    page, prev, next, last: Math.round(datalength)
  }
  );

  return
});

router.get("/search", async function (req, res) {
  const id = req.query.key;
  const list = await newModel.fulltextsearch(id);
  var data = [];
  for (i = 0; i < list.length; i++) {
    data.push("<div> <a href='/newspaper/detail/" + list[i].id + "'>" + list[i].name + "</a></div>");
  }
  res.end(JSON.stringify(data));
});

router.get('/byCat/:topicid', async function (req, res) {
  const id = +req.params.id || -1;
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const listRight = await newModel.cardviewright();
  const listCategory = await categoryModel.all();
  const listTopic = await topicModel.all();
  const arrCat = [];


  for (var i in listCategory) {
    const Category = {};

    Object.assign(Category, listCategory[i]);

    Category.topic = [];

    //objectCategory[i].topic = 'topic';

    for (var j in listTopic) {
      if (listCategory[i]['id'] === listTopic[j]['catid'])

        Category.topic.push(listTopic[j]['name']);
    };
    arrCat.push({ category: Category });

  };
  isURL = true;
  if (req.session.authUser) {

    lenURL = req.session.authUser['img'].split("//");
    if (lenURL.length < 2) {
      isURL = false;
    }
  }
  //// phân trang
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const offset = (page - 1) * config.pagination.limit;


  const [list, total] = await Promise.all([
    newModel.pageByCat(req.params.topicid, config.pagination.limit, offset),
    newModel.countByCat(req.params.topicid)
  ]);


  const nPages = Math.ceil(total / config.pagination.limit);
  const page_items = [];



  for (let i = 1; i <= nPages; i++) {
    const item = {
      value: i,
      isActive: i === page
    }
    page_items.push(item);
  }

  res.render('vwNewspaper/byCat', {
    new: list,
    listRight,
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
    id,
    login,
    isURL,
    user: req.session.authUser,
    arrCat,

  });
})

////đường dẫn theo tag
router.get('/byTag/:tagid', async function (req, res) {
  const id = +req.params.id || -1;
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const listRight = await newModel.cardviewright();
  const listCategory = await categoryModel.all();
  const listTopic = await topicModel.all();
  const arrCat = [];


  for (var i in listCategory) {
    const Category = {};

    Object.assign(Category, listCategory[i]);

    Category.topic = [];

    //objectCategory[i].topic = 'topic';

    for (var j in listTopic) {
      if (listCategory[i]['id'] === listTopic[j]['catid'])

        Category.topic.push(listTopic[j]['name']);
    };
    arrCat.push({ category: Category });

  };
  isURL = true;
  if (req.session.authUser) {

    lenURL = req.session.authUser['img'].split("//");
    if (lenURL.length < 2) {
      isURL = false;
    }
  }
  //// phân trang
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const offset = (page - 1) * config.pagination.limit;


  const [list, total] = await Promise.all([
    newModel.pageByTag(req.params.tagid, config.pagination.limit, offset),
    newModel.countByTag(req.params.tagid)
  ]);


  const nPages = Math.ceil(total / config.pagination.limit);
  const page_items = [];



  for (let i = 1; i <= nPages; i++) {
    const item = {
      value: i,
      isActive: i === page
    }
    page_items.push(item);
  }

  res.render('vwNewspaper/byTag', {
    new: list,
    listRight,
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
    id,
    login,
    isURL,
    user: req.session.authUser,
    arrCat
  });
})


module.exports = router;