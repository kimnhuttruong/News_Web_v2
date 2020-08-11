const express = require("express");
const restrict = require('../middlewares/auth.mdw');
const userModel = require("../models/user.model");
const newpaperModel = require("../models/newspaper.model");
const { compareSync } = require("bcrypt-nodejs");
const router = express.Router();
const bodyParser = require("body-parser");
var multer = require('multer')
var upload = multer({ dest: 'public/uploads/' })
const timeupgrade = 2;
router.get("/", restrict, async function (req, res) {
  var list = await userModel.single_id(req.session.authUser['id']);
  res.render("vwAccount/subscriber/profile", {
    info: list[0],
    layout: 'subscriber_dashboard',
    username: list[0]['username'],
    img: list[0]['img']
  });
});
router.get("/upgrade", restrict, async function (req, res) {
  var list = await userModel.single_id(req.session.authUser['id']);
  isPremium = parseInt(list[0]["ispremium"]);
  if (isPremium == 0)
    isPremium = false;
  else {
    isPremium = true;
  }
  res.render("vwAccount/subscriber/upgrade", {
    info: list[0],
    layout: 'subscriber_dashboard',
    username: list[0]['username'],
    img: list[0]['img'],
    timeupgrade,
    isPremium,
  });
});
router.post("/upgrade", restrict, async function (req, res) {
  var list = await userModel.single_id(req.session.authUser['id']);
  var currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + timeupgrade * 60 * 1000);
  list[0]['time_premium'] = currentDate;
  list[0]['ispremium'] = 1;
  insert = await userModel.patch(list[0]);
  
  var userupdate = await userModel.single_id(req.session.authUser['id']);
  userupdate[0]['password'] = null;
  req.session.isAuthenticated = true;
  req.session.authUser = userupdate[0];
  
  res.redirect('/account/subscriber');
});
// router.get("/profile", async function (req, res) {
//   var user = await userModel.single("ntthanh.fit.hcmus@gmail.com");
//   res.render("vwAccount/subscriber/profile", {
//     info: user[0],
//     layout: false,
//   });
// });
const fileUpload = require('express-fileupload');
router.use(fileUpload());
router.get('/editprofile', restrict, async function (req, res) {
  const list = await userModel.single_id(req.session.authUser['id']);
  if (!isNaN(Date.parse(list[0]['birthday']))) {
    var birthday = new Date(list[0]['birthday']);
  }
  else
    var birthday = new Date('01/01/1970-00:00:00 UTC');
  birthday.setTime(birthday.getTime() + 7 * 60 * 60 * 1000);
  list[0]['birthday'] = birthday.toISOString().replace("Z", "");

  res.render("vwAccount/subscriber/edit_profile", {
    layout: 'subscriber_dashboard',
    list,
    info: list[0],
    username: list[0]['username'],
    img: list[0]['img']
  });
  return;
})
router.post('/editprofile', restrict, async function (req, res) {

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
  
  res.redirect('/account/subscriber');
  return;

})
router.get("/profile/update?", async function (req, res) {
  let info = await userModel.single_id(req.query.id);
  res.render("vwAccount/subscriber/profile_edit", {
    info: info[0],
    layout: false,
  });
});
router.post("/profile/update", async function (req, res) {
  req.body.img = req.file.path.split('\\').slice(1).join('/');
  let result = userModel.patch(req.body);
  
  var userupdate = await userModel.single_id(req.session.authUser['id']);
  userupdate[0]['password'] = null;
  req.session.isAuthenticated = true;
  req.session.authUser = userupdate[0];
  
  if (result) res.redirect("../profile");
  else res.render("404");
});

module.exports = router;
