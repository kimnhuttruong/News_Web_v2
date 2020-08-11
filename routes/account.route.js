const express = require('express');

const userModel = require('../models/user.model');
const commentModel = require('../models/comment.model');
const loginGoogle = require('../utils/google-util.js');
var passport = require('passport');
const { compareSync } = require('bcryptjs');
var nodemailer = require('nodemailer');
const restrict = require('../middlewares/auth.mdw');
const { connect } = require('./_admin.route');
const { DATETIME_FORMAT } = require('date-format');
const bcrypt = require('bcrypt');
const router = express.Router();



var transporter = nodemailer.createTransport({
  service: 'gmail',
  // nhớ turn on https://myaccount.google.com/lesssecureapps
  auth: {
    user: 'teamttta@gmail.com',
    pass: 'ttta123456'
  }
});
function mailOptions(to, maxacnhan) {
  return {
    from: 'teamttta@gmail.com',
    to: to,
    subject: 'Confirm reset your password',
    html: '<h3>Dear Trường</h3>'
      + '<p>Sombody(hopefully you) requested a new password for the Project News account for <b>star.knt.8@gmail.com</b> .No changes have been made to your account yet.</p>'
      + '<p>Your code confirm:</p>'
      + '<br>'
      + '<h2>' + maxacnhan + '</h2>'
      + "<p>We 'll be here to help you with any step along the way. You can find answers to most questions and get in touch with us at www.google.com</p>"
      + '<br>'
      + '<p>If you did not request a new password, please let us know immeidately by replying to this email</p>'
      + '<p>Thanks,</p>'
      + '<p>The TTTA Team</p>'

  };   // The function returns the product of p1 and p2
}



router.use(passport.initialize());
router.use(passport.session()); // pers
require('../config/passport')(passport);

router.get('/login', function (req, res) {
  url = req.query.retUrl;
  fullcookie = (req.headers.cookie).split("; login=");

  var user = [];
  for (i = 0; i < fullcookie.length; i++) {
    datatamp1 = (fullcookie[i]).split("login%3A");
    if (datatamp1.length > 1) {
      user = [{ email: datatamp1[1].replace("%40", "@"), password: datatamp1[2] }]
    }
  }
  if (user.length == 0) {
    user = [{ email: "", password: "" }]
  }

  if (typeof user != "undefined") {
    res.render('vwAccount/action/login', {
      layout: false,
      data: user
    });
    return;
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render("vwAccount/action/login", {
    layout: false
  });
})

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async function (req, res) {
    const list = await userModel.single(req.user['emails'][0].value);
    if (list.length == 0) {

      user = { email: req.user['emails'][0].value, img: req.user['photos'][0].value, username: req.user['displayName'], roleid: "2" };

      
      const data = await userModel.add(user);
      const list2 = await userModel.single(req.user['emails'][0].value);
      req.session.isAuthenticated = true;
      req.session.authUser = list2[0];
      res.render('vwAccount/action/forgotpassword', { layout: false });
      _email=req.user['emails'][0].value;
    }
    else{
    const list2 = await userModel.single(req.user['emails'][0].value);
    req.session.isAuthenticated = true;
    req.session.authUser = list2[0];
    res.redirect('/');
    }
  });

router.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email'], }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  async function (req, res) {
    const list = await userModel.single(req.user['id']+"@facebook.com");
    if (list.length == 0) {

      user = { email: req.user['id']+"@facebook.com", username: req.user['displayName'], roleid: "2" };

      
      const data = await userModel.add(user);
      const list2 = await userModel.single(req.user['id']+"@facebook.com");
      req.session.isAuthenticated = true;
      req.session.authUser = list2[0];
      res.render('vwAccount/action/forgotpassword', { layout: false });
      _email=req.user['id']+"@facebook.com";
    }
    else{
    const list2 = await userModel.single(req.user['id']+"@facebook.com");
    req.session.isAuthenticated = true;
    req.session.authUser = list2[0];
    res.redirect('/');
    }
  });
var url;

router.post('/login', async function (req, res) {
  const listuser = await userModel.all();
  tontai = false;
  
  for (i = 0; i < listuser.length; i++) {
    if (listuser[i]["email"] == req.body.email) {
      tontai = true;
      // console.log(bcrypt.hashSync(req.body['password'], 10));
      // console.log(listuser[i]["password"]);
      if (!bcrypt.compareSync(req.body['password'], listuser[i]["password"])) {
       
        user = [{ email: req.body.email, password: req.body.password }]
        res.render("vwAccount/action/login", {
          layout: false,
          data: user,
        });
      }
      else {
        
        const list = await userModel.single_id(listuser[i]["id"]);
        
        transporter.sendMail(mailOptions(req.body.email, "000000"), function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        {
          list[0]['password'] = null;
          req.session.isAuthenticated = true;
          req.session.authUser = list[0];

          if (req.body.checkbox == "on") {
            res.cookie('login', "login:" + req.body.email + "login:" + req.body.password + "login:");

          }
          else {
            res.clearCookie("login");
          }
          if ((typeof url) != "undefined")
            res.redirect(url);
          else {
            res.redirect("/");
          }
        }
      }
    }
  }

  user = [{ email: req.body.email, password: req.body.password }]
  res.render("vwAccount/action/login", {
    layout: false,
    data: user,
  });
}
);
router.post('/login-is-available',async function (req, res) {
  const listuser = await userModel.all();
  for (i = 0; i < listuser.length; i++) {
    if (listuser[i]["email"] == req.body.email) {
      if (bcrypt.compareSync(req.body['password'], listuser[i]["password"]))
      {
        return res.json(true);
      }
      else
        res.json(false);
    }
  }
  res.json(false);
});
router.post('/register', async function (req, res) {
  const list = await userModel.single(req.body['email']);
  if (list.length == 0) {
    req.body['password'] = bcrypt.hashSync(req.body['password'], 10);
    const data = await userModel.add(req.body);
    
    var userupdate = await userModel.single(req.body['email']);
    userupdate[0]['password'] = null;
    req.session.isAuthenticated = true;
    req.session.authUser = userupdate[0];
    res.redirect('/');
    
    return;
  } else {
    res.render("vwAccount/action/register", {
      layout: false,
      data: 'tài khoản đã tồn tại', error: true
    });
    return
  }
})

router.get('/forgotpassword', function (req, res) {
  if (!req.session.isAuthenticated) {
    res.render("vwAccount/action/resetpass", {
      layout: false
    });
    return;
  }
  res.render("vwAccount/action/register", {
    layout: false
  });
  return;
})

router.use('/admin', require('./_admin.route'));
router.use('/writer', require('./_writer.route'));
router.use('/editor', require('./_editor.route'));
router.use('/subscriber', require('./_subscriber.route'));

router.get('/dashboard', restrict, function (req, res) {

  res.render('vwAccount/admin/dashboard', { layout: false });

  return;
});

router.get('/resetpassword', function (req, res) {
  res.render('vwAccount/action/resetpass', { layout: false });
  return;
})
router.get('/changepassword', restrict, function (req, res) {
  res.render('vwAccount/action/changepassword', { layout: false, });
  return;

})
router.post('/changepassword_success' ,async function (req, res) {
  var list = req.session.authUser;
  const user = await userModel.single_id(list['id']);
  if(user.length!=0)
  {
    console.log(bcrypt.compareSync(req.body['oldpassword'], user[0]['password']));
    if (bcrypt.compareSync(req.body['oldpassword'], user[0]['password'])) {
      user[0]["password"] = bcrypt.hashSync(req.body['password'], 10);
      
      update = await userModel.patch(user[0]);
      console.log(user[0]);
      var userupdate = await userModel.single_id(list['id']);
      console.log(userupdate);
      userupdate[0]['password'] = null;
      req.session.isAuthenticated = true;
      req.session.authUser = userupdate[0];

      res.redirect('/');
    }
    else {
      res.redirect('/account/changepassword');
    }
  }
  return;
})
_maxacnhan = "YOUR PASSWORD HAS CHANGED";
_email = "";
router.post('/resetpassword', function (req, res) {
  _maxacnhan = Math.floor(100000 + Math.random() * 900000);
  _email = req.body.email;
  transporter.sendMail(mailOptions(req.body.email, _maxacnhan), function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render('vwAccount/action/confirm', { layout: false });
  return;
})
router.post('/resetpassword_success', async function (req, res) {
  var list = await userModel.single(_email);
  if(list.length>0)
 { list[0]['password'] = bcrypt.hashSync(req.body['password'], 10);
  const update =await userModel.patch(list[0]);

  var userupdate = await userModel.single_id(req.session.authUser['id']);
  userupdate[0]['password'] = null;
  req.session.isAuthenticated = true;
  req.session.authUser = userupdate[0];

  res.redirect('/');
  return;
  }
})
router.post('/confirm', function (req, res) {
  if (req.body.MaXacNhan == _maxacnhan)
    res.render('vwAccount/action/forgotpassword', { layout: false });
  else {
    res.render('vwAccount/action/confirm', { layout: false, data: "Mã sai", error: true });
  }
})

router.get('/logout', async function (req, res) {
  req.session.isAuthenticated = false;
  req.session.authUser = null;
  req.session.destroy(function (err) {
    // cannot access session here
  })

  res.redirect('/');
});

router.get('/register', function (req, res) {
  if (typeof req.session.isAuthenticated != "undefined") {
    res.redirect('/');
    return;
  }
  else {
    res.render("vwAccount/action/register", {
      layout: false
    });
    return
  }
})
router.get('/register-is-available',async function (req, res) {
    const email= await userModel.single(req.query.email);
    
    if(email.length==0)
    {
      return res.json(true);
    }
    
    res.json(false);
})

router.post('/comment', restrict, async function (req, res) {
  const data = req.body;
  const id_news = +req.body.newspaperid;
  data['userid'] = req.session.authUser['id'];
  date = new Date(Date.now());

  data['create_time'] = date;

  const instert_comment = await commentModel.add(data);
  res.redirect(`/newspaper/detail/${id_news}`);

  return;
}

)
module.exports = router;

