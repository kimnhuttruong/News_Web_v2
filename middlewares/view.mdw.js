const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');
const numeral = require('numeral');
const dob_date = require('date-format');

module.exports = function (app) {
  app.engine('hbs', exphbs({
    layoutsDir: 'views/_layouts',
    defaultLayout: 'main',
    partialsDir: 'views/_partials',
    extname: '.hbs',
    helpers: {
      section: hbs_sections(),
      format_number: function (value) {
        return numeral(value).format('0,0');

      },
      format_new_desc: function (value) {
        if (value.length >= 20)
          return value.substr(0, 20) + "...";
        else
          return value;
      },
      format_new_devide: function (value, views) {
        return 100 * parseInt(value) / parseInt(views);


      },
      // format_DoB: function (date) {
      //   return dob_date(date, 'dd-MM-yyyy')
      // },
      role: function (roleid) {
        role = "";
        switch (roleid) {
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
        return role;
      },

      active_role(roleid, value) {

        if (roleid == value)
          return 'selected';
        else
          return;
      },
      format_date: function (str) {
        time = ""
        if (str == null)
          return;
        oldday = new Date(str);
        ngaygio = String(oldday).split(" ");
        day = oldday.getDate();
        now=new Date(Date.now());
        const diffTime = Math.abs(oldday.getTime() - now.getTime());
        truocsau="trước";
        if(oldday.getTime() - now.getTime()>0)
          truocsau="sau";
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60*24)); 
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); 
        const diffMinutes = Math.ceil(diffTime / (1000 * 60 )); 
        
        if(diffMinutes<60)
          return diffMinutes+ " phút "+truocsau;
        if(diffHours<24)
          return diffHours +" giờ "+truocsau;
        if(diffDays<10)
          return diffDays +" ngày "+truocsau;
        if (ngaygio[4])
          time = ngaygio[4].slice(0, 5);
        if (day < 10)
          day = '0' + day
        month = oldday.getMonth() + 1;
        if (month < 10)
          month = '0' + month
        year = oldday.getFullYear();
        if (year < 10)
          year = '000' + year
        else if (year < 100)
          year = '00' + year
        else if (year < 1000)
          year = '0' + year
        return time + " " + day + '/' + month + '/' + year;
      },
      upper_login: function (login) {
        if (login == 'login')
          return 'Login';
        return 'Logout'
      }, status: function (statusid) {
        role = "";
        switch (statusid) {
          case 1:
            role = "Đã được duyệt & chờ xuất bản";
            break;
          case 2:
            role = "Đã xuất bản";
            break;
          case 3:
            role = "Bị từ chối";
            break;
          case 4:
            role = "Chưa được duyệt";
            break;

        }
        return role;
      },
      premium: function (date) {
        if (date == null)
          return;
        if (date != null) {
          oldday = new Date(date);
          ngaygio = String(oldday).split(" ");
          day = oldday.getDate();
          if (ngaygio[4])
            time = ngaygio[4].slice(0, 5);
          if (day < 10)
            day = '0' + day
          month = oldday.getMonth() + 1;
          if (month < 10)
            month = '0' + month
          year = oldday.getFullYear();
          if (year < 10)
            year = '000' + year
          else if (year < 100)
            year = '00' + year
          else if (year < 1000)
            year = '0' + year
          return time + " " + day + '/' + month + '/' + year;

        }
        else
          return 'Hết Hạn';
      },
      premium_status: function (ispremium) {
        if (ispremium == 1)
          return 'premium';
        return ''
      },
      print_topic: function (topics, idTopics) {
        const items = topics.map(topic => "<a class=\"dropdown-item\" role=\"presentation\" href=\"#\">" + topic + "</a>");
        var itemsHtml = '';
        for (var i in topics) {

          //itemsHtml += "<a class=\"dropdown-item\" role=\"presentation\" href=\"/newspaper/byCat/" + idTopics[i] + " \">" + topics[i] + "</a>";
          itemsHtml += "<a class=\"dropdown-item\" role=\"presentation\" href=\"#" + idTopics[i] + " \">" + topics[i] + "</a>";
        };
        return itemsHtml;
      },
      upper_login: function (login) {
        if (login == 'login')
          return 'Đăng nhập';
        return 'Đăng xuất'
      },
      checkbox: function (int) {
        if (int == '0' || int == 0)
          return '';
        return 'checked';
      },
      cantcomment: function (int) {
        if (int == null || int =="")
          return "Đăng Nhập Để";
        return "";
      },
      disabled: function (int) {
        if (int == null)
          return "disabled"
        return "";
      },
      imgnull: function (int) {

        if (int == null)
          return "https://nb-egypt.com/img/not-available.jpg"
        return int;
      },
      statusNespaper: function (status) {// chuyen sang trrang thai bai viet tu int 
        switch (status) {
          case 1:
            return 'Đã được duyệt & chờ xuất bản';
          case 2:
            return 'Đã xuất bản';
          case 3:
            return 'Bị từ chối';
          case 4:
            return 'Chưa được duyệt';
        }
      },
      allowUpdate: function (status) {
        switch (status) {
          case 1:
          case 2:
            return false;
          case 3:
          case 4:
            return true;
        }
      },
      add: function (a, b) {
        return a + b;
      },
      equalTopic:function( idDefault,idCurent){
        if(idDefault == idCurent)
          return "selected";
        else
          return "";
      },
      img_premium: function(ispremium,timepremium)
      { 
        if(typeof(timepremium) =="undefined")
            timepremium= new Date("01/01/1970-00:00:00 UTC");
        else
          timepremium= new Date(timepremium);
        now=  Date.now();
        now= new Date (now);
        if(ispremium && (timepremium.getTime()-now.getTime())>0)
          return "";
        
        if(ispremium && (timepremium.getTime()-now.getTime())<=0)
          return "filter: blur(5px);";
        else
          return "";
      },
      content_premium: function(ispremium)
      { 
        
        if(ispremium)
          return " <i class='fa fa-star' aria-hidden='true'></i> Premium";
        else
          return "";
      },
      
    }
  }));
  app.set('view engine', 'hbs');
}
