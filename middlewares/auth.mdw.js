const newsModel = require('../models/newspaper.model');
module.exports = async function (req, res, next) {

  if (!req.session.isAuthenticated) {
    url = req.originalUrl;
    url = url.split("/")
    exits = false;
    for (i = 0; i < url.length; i++) {
      if (url[i] == "detail"||url[i] == "download") {
        ispremium = 0;
        list = await newsModel.single_id(url[url.length - 1]);
        if (list.length > 0)
          ispremium = list[0]['ispremium'];
        if (ispremium)
          return res.redirect(`/account/login?retUrl=${req.originalUrl}`);
        else
          return next();
      }
    }
    return res.redirect(`/account/login?retUrl=${req.originalUrl}`);
    // return res.redirect(`/notAuthentication`);
  }
  else {
    role = "";
    switch (req.session.authUser['roleid']) {
      case 1:
        role = "admin";
        break;
      case 2:
        role = "subscriber";
        break;
      case 3:
        role = "writer";
        break;
      case 4:
        role = "editor";
        break;
    }
    url = req.originalUrl;
    url = url.split("/")
    exits = false;
    for (i = 0; i < url.length; i++) {
      if (url[i] == role || url[i] == "changepassword" || url[i] == "comment" || role == 'admin')
        exits = true;
      if (url[i] == "detail" ||url[i] == "download") {
        ispremium = 0;
        list = await newsModel.single_id(url[url.length - 1]);
        if (list.length > 0)
          ispremium = list[0]['ispremium'];
        timepremium = req.session.authUser['time_premium'];
        timepremium = new Date(timepremium);
        now = Date.now();
        now = new Date(now);
        if (ispremium && (timepremium.getTime() - now.getTime()) > 0)
          exits = true;
        if (ispremium && (timepremium.getTime() - now.getTime()) <= 0)
          {           
            return res.redirect("/account/subscriber/upgrade");
          
      }
        else
          exits = true;
      }
    }
    if (exits) {
      next();
    }
    else {
      return res.redirect(`${req.originalUrl}`);
    }
  }
} 