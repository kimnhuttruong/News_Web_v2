const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const config = require('../config/default.json')
const newsModel = require('../models/newspaper.model');
const multer = require('multer');
const categoryModel = require('../models/category.model');
const topicModel = require('../models/topic.model');
const { urlencoded } = require('body-parser');
// const newModel = require('../models/newspaper.model');
// const tagModel = require("../models/tag.model");
// const tag_newspaperModel = require("../models/tag_newspaper.model")
const restrict = require('../middlewares/auth.mdw');
const { length } = require('../models/user.model');
// const newspaperModel = require('../models/newspaper.model');
router.get('/', async function (req, res) {
  res.send("xxxxxx");

})


router.get('/', async function (req, res) {
  const listRight = await newsModel.cardviewright();
  const listPopular = await newsModel.popularnew();
  const timeNews = await newsModel.top10();
  const slide1 = await newsModel.slide1();
  const slide2 = await newsModel.slide2();
  const slide3 = await newsModel.slide3();
  const login = !req.session.isAuthenticated ? 'login' : 'logout';
  const listCategory = await categoryModel.all();
  // const listTopic = await topicModel.all();
  const listTopCategory = await newsModel.top10Category();
  
  const arrCat = await listCategory;
  for (cat in arrCat) {
    topics = await topicModel.single_catid(arrCat[cat]['id']);
    arrCat[cat]['topic'] = topics;
  }
  // const list = await userModel.single_id(req.session.authUser['id']);
  isURL = true;
  if (req.session.authUser) {
    if (req.session.authUser['img'] != null) {
      lenURL = req.session.authUser['img'].split("//");
      if (lenURL.length < 2) {
        isURL = false;
      }
    }
  }
  const slide_alt = ['First slide', 'Second slide', 'Third slide'];
  slideImg = []
  for (var i in slideImg) {
    slideImg[i].alt = slide_alt[i];
  }
  res.render('home', {
    slide1, slide2, slide3,
    listRight,
    listRight_empty: listRight.lenght === 0,
    listPopular,
    timeNews,
    timeNews_empty: timeNews.lenght === 0,
    listPopular_empty: listPopular.lenght === 0,
    login,
    isURL,
    user: req.session.authUser,
    arrCat,
    listTopCategory
  });

})





// router.post('/', async (req, res) => {
//   const listnew = await newModel.cardview();
//   const listright = await newModel.cardviewright();
//   const listpopular = await newModel.popularnew();
//   const alllist = await newModel.top1();

//   res.render('home', {
//     alllist,
//     listnew,
//     listright,
//     listpopular,
//   }
//   );
//   return
// })


module.exports = router;