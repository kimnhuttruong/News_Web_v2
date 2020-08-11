const express = require('express');
const restrict = require('../middlewares/auth.mdw');
const userModel = require('../models/user.model');
const newspaperModel = require('../models/newspaper.model');
const tag_newspaperModel = require('../models/tag_newspaper.model');
const commentModel = require('../models/comment.model');
const topicModel = require('../models/topic.model');
const taskModel = require('../models/task.model');
const categoryModel = require('../models/category.model');
const tagModel = require('../models/tag.model');
const roleModel = require('../models/role_user.model');
const bcrypt = require('bcrypt');
const imageModel = require("../models/images.model");
var multer = require('multer');
const router = express.Router();
var upload = multer({ dest: '../public/uploads' });
router.get('/', restrict, async function (req, res) {

    const data = await userModel.all();
    const datanews = await newspaperModel.all();
    const datanews_time = await newspaperModel.top5_time();;
    const datatops = await newspaperModel.top5();
    const datatopscomment = await commentModel.top5();
    total_view = await newspaperModel.sumview();
    total_view = total_view[0]['view'];
    total_subscriber = 0;
    total_editor = 0;
    total_writer = 0;
    for (i = 0; i < datatops.length; i++) {
        datatops[i]['views'] = total_view;
    }
    max = 0,
        sumcomment = 0;

    for (i = 0; i < datatopscomment.length; i++) {

        sumcomment += datatopscomment[i]['sum_cm'];
    }
    for (i = 0; i < datatopscomment.length; i++) {
        for (j = 0; j < datatopscomment.length; j++) {
            if (parseInt(datatopscomment[i]['sum_cm']) <= parseInt(datatopscomment[j]['sum_cm'])) {
                temp = datatopscomment[i];
                datatopscomment[i] = datatopscomment[j];
                datatopscomment[j] = temp;
            }
        }
    }
    for (i = 5; i < datatopscomment.length; i++) {
        delete datatopscomment[i];
    }
    sum4cm = 0;
    for (i = 0; i < datatopscomment.length; i++) {

        switch (i) {
            case 0:
                datatopscomment[i]['color'] = "red";
                datatopscomment[i]['total_comment'] = Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment);
                sum4cm += Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment)
                break;
            case 1:
                datatopscomment[i]['color'] = "blue";
                datatopscomment[i]['total_comment'] = Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment);
                sum4cm += Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment)
                break;
            case 2:
                datatopscomment[i]['color'] = "red";
                datatopscomment[i]['total_comment'] = Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment);
                sum4cm += Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment)
                break;
            case 3:
                datatopscomment[i]['color'] = "green";
                datatopscomment[i]['total_comment'] = Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment);
                sum4cm += Math.round(parseInt(datatopscomment[i]['sum_cm']) * 100 / sumcomment)
                break;
            case 4:
                datatopscomment[i]['color'] = "gray";
                datatopscomment[i]['desc'] = "Khác";
                datatopscomment[i]['total_comment'] = Math.round(100 - sum4cm);
                break;

        }
    }

    for (i = 0; i < data.length; i++) {
        // total_subscriber++;

        switch (data[i]['roleid']) {
            case 2:
                total_subscriber++;
                break;
            case 3:
                total_writer++;
                break;
            case 4:
                total_editor++;
                break;
            default:
                break;
            // code block
        }
    }
    const list = await userModel.single_id(req.session.authUser['id']);

    res.render('vwAccount/admin/home_dashboard', {
        total_subscriber,
        total_editor,
        total_writer,
        total_view,
        datatops,
        datanews_time,
        datatopscomment,
        total_new: datanews.length,
        layout: 'admin_dashboard',
        username: list[0]['username'],
        img: list[0]['img'],
    });

})
router.get('/accounts', restrict, async function (req, res) {
    origin = req.originalUrl;
    if (origin == '/account/admin/accounts')
        origin = "/account/admin/accounts" + "?";
    var roleid = parseInt(req.query.roleid) || -1;
    var roles = await roleModel.all();
    origin = origin.replace("&page=" + req.query.page, "");
    const list = await userModel.single(req.session.authUser['email']);
    const lengthListUSer = await userModel.lengthall_offset(roleid);
    length = lengthListUSer[0]['count(*)'];
    length = length / 10;
    var page = parseInt(req.query.page) || 1;
    const data = await userModel.all_offset(roleid, 10, 10 * (page - 1));
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
            for (i = Math.round(length + 1 - 4); i <= parseInt(length) + 1; i++) {
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
    res.render("vwAccount/admin/account_dashboard", {
        layout: 'admin_dashboard',
        data, roleid, roles, origin,
        username: list[0]['username'],
        img: list[0]['img'],
        pages,
        page, prev, next, last: Math.round(length)
    });
    return;

})
router.get('/news', restrict, async function (req, res) {
    var catid = parseInt(req.query.catid) || -1;
    var topicid = parseInt(req.query.topicid) || -1;
    var topics = await topicModel.single_catid(catid);
    origin = req.originalUrl;
    if (origin == '/account/admin/news')
        origin = "/account/admin/news" + "?";
    var cats = await categoryModel.all();
    for (i = 0; i < cats.length; i++) {
        cats[i]["topic"] = await topicModel.single_catid(cats[i]["id"]);
    }
    // const data = await newspaperModel.all_detail();

    const list = await userModel.single(req.session.authUser['email']);
    const lengthListUSer = await newspaperModel.length_offset(catid, topicid);
    length = lengthListUSer[0]['count(*)'];
    length = length / 10;
    var page = parseInt(req.query.page) || 1;
    origin = origin.replace("&page=" + req.query.page, "");
    const data = await newspaperModel.all_offset(catid, topicid, 10, 10 * (page - 1));
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
            for (i = Math.round(length + 1 - 4); i <= parseInt(length) + 1; i++) {
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
    res.render("vwAccount/admin/news_dashboard", {
        layout: 'admin_dashboard',
        data, cats, origin, topics, topicid, catid,
        username: list[0]['username'],
        img: list[0]['img'], pages,
        page, prev, next, last: Math.round(length)
    });
    return;

})
router.get('/categories', restrict, async function (req, res) {


    const list = await userModel.single(req.session.authUser['email']);
    const lengthListUSer = await categoryModel.length();
    length = lengthListUSer[0]['count(*)'];
    length = length / 10;
    var page = parseInt(req.query.page) || 1;
    const data = await categoryModel.all_offset(10, 10 * (page - 1));
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
            for (i = Math.round(length + 1 - 4); i <= parseInt(length) + 1; i++) {
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
    res.render("vwAccount/admin/categories_dashboard", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img'], pages,
        page, prev, next, last: Math.round(length)
    });
    return;

})
router.get('/topics', restrict, async function (req, res) {
    origin = req.originalUrl;
    if (origin == '/account/admin/topics')
        origin = "/account/admin/topics" + "?";
    var catid = parseInt(req.query.catid) || -1;
    var cats = await categoryModel.all();
    origin = origin.replace("&page=" + req.query.page, "");
    // const data = await topicModel.allWithDetails();

    const list = await userModel.single(req.session.authUser['email']);
    const lengthListUSer = await topicModel.lengthall_offset(catid);
    length = lengthListUSer[0]['count(*)'];
    length = (length / 10);
    var page = parseInt(req.query.page) || 1;
    const data = await topicModel.all_offset(catid, 10, 10 * (page - 1));
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
            for (i = Math.round(length + 1 - 4); i <= parseInt(length) + 1; i++) {
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
    res.render("vwAccount/admin/topics_dashboard", {
        layout: 'admin_dashboard',
        data, cats, catid, origin,
        // authUser:req.session.authUser
        username: list[0]['username'],
        img: list[0]['img'], pages,
        page, prev, next, last: Math.round(length)
    });
    return;

})
router.get('/edittag/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await tagModel.single_id(id);
    const list = await userModel.single(req.session.authUser['email']);
    res.render("vwAccount/admin/edit_tag", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})
router.get('/tags', restrict, async function (req, res) {

    // const data = await tagModel.all_tag();
    const list = await userModel.single(req.session.authUser['email']);
    const lengthListUSer = await tagModel.length();
    length = lengthListUSer[0]['count(*)'];
    length = length / 10;
    var page = parseInt(req.query.page) || 1;
    const data = await tagModel.all_offset(10, 10 * (page - 1));
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
            for (i = Math.round(length + 1 - 4); i <= parseInt(length) + 1; i++) {
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
    res.render("vwAccount/admin/tags_dashboard", {
        layout: 'admin_dashboard',
        data,
        // authUser:req.session.authUser
        username: list[0]['username'],
        img: list[0]['img'], pages,
        page, prev, next, last: Math.round(length)
    });
    return;

})
router.get('/edituser/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const task = await taskModel.single_id_detail(id);
    const data = await userModel.single_id(id);
    const list = await userModel.single(req.session.authUser['email']);
    if (!isNaN(Date.parse(data[0]['time_premium']))) {
        var time_premium = new Date(data[0]['time_premium']);
    }
    else
        var time_premium = new Date('01/01/1970-00:00:00 UTC');
    time_premium.setTime(time_premium.getTime() + 7 * 60 * 60 * 1000);
    data[0]['time_premium'] = time_premium.toISOString().replace("Z", "");

    if (!isNaN(Date.parse(data[0]['birthday']))) {
        var birthday = new Date(data[0]['birthday']);
    }
    else
        var birthday = new Date('01/01/1970-00:00:00 UTC');
    birthday.setTime(birthday.getTime() + 7 * 60 * 60 * 1000);
    data[0]['birthday'] = birthday.toISOString().replace("Z", "");
    res.render("vwAccount/admin/edit_user", {
        layout: 'admin_dashboard',
        data,
        task,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})
// router.get('/edituser', restrict, async function (req, res) {

//     id = (req.params.id);
//     const data = await userModel.single_id(req.session.authUser['id']);
//     const list = await userModel.single(req.session.authUser['email']);
//     res.render("vwAccount/admin/edit_user", {
//         layout: 'admin_dashboard',
//         data,
//         username: list[0]['username'],
//         img: list[0]['img']
//     });
//     return;

// })
router.get('/adduser', restrict, async function (req, res) {


    const task = await taskModel.single_id_detail("xmfnejsjf_tambay");
    data = ["x"];
    const list = await userModel.single_id(req.session.authUser['id']);
    res.render("vwAccount/admin/add_user", {
        layout: 'admin_dashboard',
        data,
        task,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})

router.get('/deleteuser/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await userModel.del(id);
    res.redirect('/account/admin/accounts');
    return;

})
const fileUpload = require('express-fileupload');
// const { delete } = require('./_writer.route');
router.use(fileUpload());
router.post('/adduser', restrict, async function (req, res) {


    var cb = [];
    cb = req.body['cb'];
    delete req.body['cb'];
    if (typeof cb == "undefined")
        cb = [];
    if (req.files != null) {
        let image = req.files.img;
        // Use the mv() method to place the file somewhere on your server
        urlAvatar = './public/uploads/' + req.body['email'] + "_" + image.name;
        image.mv(urlAvatar);
        req.body.img = urlAvatar.replace("./", "http://localhost:3000/");
    }
    var data = req.body;
    data.password = bcrypt.hashSync(req.body.email, 10);
    const insert = await userModel.add(data);
    const list= await userModel.single(data.email);
    var cb_null = [];
    cats = await categoryModel.all();
    for (i = 0; i < cats.length; i++) {
        exist = true;
        for (j = 0; j < cb.length; j++) {
            if (cats[i]['id'] == cb[j])
                exist = false;
        }
        if (exist)
            cb_null.push(cats[i]['id']);
    }
    for (i = 0; i < cb.length; i++) {
        listtask = await taskModel.single_data(list[0]['id'], cb[i]);
        if (listtask.length == 0) {
            datatask = [{ iduser: list[0]['id'], catid: cb[i] }];
            await taskModel.add(datatask[0]);
        }
        else {
            datatask = [{ id: listtask[0]['id'], iduser: list[0]['id'], catid: cb[i] }];
            await taskModel.patch(datatask[0]);
        }
    }
    for (i = 0; i < cb_null.length; i++) {
        listtask = await taskModel.single_data(list[0]['id'], cb_null[i]);
        if (listtask.length > 0)
            delete_task = taskModel.del(listtask[0]['id']);
    }
    res.redirect('/account/admin/accounts');
    return;

})


router.post('/edituser', restrict, async function (req, res) {

    const list = await userModel.single_id(req.body['id']);
    const data = req.body;
    var cb = [];
    cb = req.body['cb'];

    delete req.body['cb'];
    if (typeof cb == "undefined")
        cb = [];


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

    var cb_null = [];
    cats = await categoryModel.all();
    for (i = 0; i < cats.length; i++) {
        exist = true;
        for (j = 0; j < cb.length; j++) {
            if (cats[i]['id'] == cb[j])
                exist = false;
        }
        if (exist)
            cb_null.push(cats[i]['id']);
    }
    for (i = 0; i < cb.length; i++) {
        listtask = await taskModel.single_data(list[0]['id'], cb[i]);
        if (listtask.length == 0) {
            datatask = [{ iduser: list[0]['id'], catid: cb[i] }];
            await taskModel.add(datatask[0]);
        }
        else {
            datatask = [{ id: listtask[0]['id'], iduser: list[0]['id'], catid: cb[i] }];
            await taskModel.patch(datatask[0]);
        }
    }
    console.log(cb);
    console.log(cb_null);
    for (i = 0; i < cb_null.length; i++) {
        listtask = await taskModel.single_data(list[0]['id'], cb_null[i]);
        if (listtask.length > 0)
            delete_task = taskModel.del(listtask[0]['id']);
    }

    res.redirect('/account/admin/accounts');
    return;

})
router.get('/editnews/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await newspaperModel.single_id(id);
    const list = await userModel.single(req.session.authUser['email']);
    res.render("vwAccount/admin/edit_news", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})
router.get('/editcategory/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await categoryModel.single_id(id);
    const list = await userModel.single(req.session.authUser['email']);
    res.render("vwAccount/admin/edit_category", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})
router.get('/addcategory', restrict, async function (req, res) {

    id = (req.params.id);
    const data = ["xx"];
    const list = await userModel.single(req.session.authUser['email']);
    res.render("vwAccount/admin/add_category", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})

router.post('/addcategory', restrict, async function (req, res) {

    const list = await userModel.single(req.body['email']);
    const data = req.body

    const insert = categoryModel.add(req.body);
    res.redirect('/account/admin/categories');
    return;

})
router.post('/editcategory', restrict, async function (req, res) {

    const list = await userModel.single(req.body['email']);
    const data = req.body

    const insert = categoryModel.patch(req.body);
    res.redirect('/account/admin/categories');
    return;

})
router.post('/edittag', restrict, async function (req, res) {

    const list = await userModel.single(req.body['email']);
    const data = req.body

    const insert = tagModel.patch(req.body);
    res.redirect('/account/admin/tags');
    return;

})
router.post('/addtag', restrict, async function (req, res) {

    const list = await userModel.single(req.body['email']);
    const data = req.body

    const insert = tagModel.add(req.body);
    res.redirect('/account/admin/tags');
    return;

})
router.get('/addtag', restrict, async function (req, res) {

    id = (req.params.id);
    const data = ["xx"];
    const list = await userModel.single(req.session.authUser['email']);
    res.render("vwAccount/admin/add_tag", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})
router.get('/deletecategory/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await categoryModel.del(id);
    res.redirect('/account/admin/categories');
    return;

})
router.get('/edittopic/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await topicModel.single_id(id);
    const category = await categoryModel.all();
    const list = await userModel.single(req.session.authUser['email']);

    res.render("vwAccount/admin/edit_topic", {
        layout: 'admin_dashboard',
        data, category, topicid: id,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})
router.get('/addtopic', restrict, async function (req, res) {

    id = (req.params.id);
    const data = ["xxx"];
    const category = await categoryModel.all();
    const list = await userModel.single(req.session.authUser['email']);

    res.render("vwAccount/admin/add_topic", {
        layout: 'admin_dashboard',
        data, category, topicid: id,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})

router.post('/edittopic', restrict, async function (req, res) {

    const list = await userModel.single(req.body['email']);
    const data = req.body

    const insert = topicModel.patch(req.body);
    res.redirect('/account/admin/topics');
    return;

})
router.post('/addtopic', restrict, async function (req, res) {

    const list = await userModel.single(req.body['email']);
    const data = req.body

    const insert = topicModel.add(req.body);
    res.redirect('/account/admin/topics');
    return;

})
router.get('/deletetopic/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await topicModel.del(id);
    res.redirect('/account/admin/topics');
    return;

})
router.get('/deletetag/:id', restrict, async function (req, res) {

    id = (req.params.id);
    const data = await tagModel.del(id);
    res.redirect('/account/admin/tags');
    return;

})
router.get('/profile', restrict, async function (req, res) {

    const list = await userModel.single(req.session.authUser['email']);
    const data = await userModel.single(req.session.authUser['email']);

    res.render("vwAccount/admin/profile", {
        layout: 'admin_dashboard',
        data,
        username: list[0]['username'],
        img: list[0]['img']
    });
    return;

})

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
    req.session.newsId = idNews;
    res.redirect('./upload_avatar');
});


router.get("/view/newspaper/add", restrict, async function (req, res) {
    var user = await userModel.single_id(req.session.authUser['id']);
    var cats = await categoryModel.all();
    for (i = 0; i < cats.length; i++) {
        cats[i]["topic"] = await topicModel.single_catid(cats[i]["id"]);
    }
    var topic = await topicModel.all();
    const images = await imageModel.byUser(req.session.authUser['id']);
    res.render("vwAccount/admin/newspaper_add", {
        layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
        topic,
        images, cats,
        empty: images.lenght == 0,
        img: user[0]['img'],
        username: user[0]['username'],
    });
});

router.get("/view/newspaper/upload_img", restrict, async function (req, res) {
    const idUser = req.session.authUser.id;
    const images = await imageModel.byUser(idUser);
    res.render("vwAccount/admin/upload_img",
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

            res.render('vwAccount/admin/upload_img', { layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard', images, });
        }
        else res.send(err);
    })
})

router.get('/view/newspaper/upload_avatar', restrict, async function (req, res) {
    if (req.session.newsAdd) {
        res.render("vwAccount/admin/upload_avatar",
            {
                layout: false,
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
                await newspaperModel.updateAvatar(idNews[0]['id'], _fileName);

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
    role = "";
    if (req.session.authUser.roleid != 1)
        role = "writer";
    else
        role = "admin";
    res.render("vwAccount/writer/upload_avatarBigsize",
        {
            role,
            layout: true,
        }
    );
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
                await newspaperModel.updateAvatarBigSize(idNews[0]['id'], 'http://localhost:3000/public/uploads/' + _fileName);

            },

            destination(req, file, cb) {
                cb(null, './public/uploads');
            }
        });
        const upload = multer({ storage });
        upload.array('fuMain', 3)(req, res, async function (err) {
            if (!err) {

                res.render('vwAccount/admin/sendDraft_successful');
            }
            else res.send(err);
        });
        req.session.newsId = -1;
        req.session.newsAdd = false;
    }
    else
        res.render('500');

});


router.get("/news/update/:id", restrict, async function (req, res) {
    var user = await userModel.single_id(req.session.authUser['id']);
    const idUser = req.session.authUser.id;
    const idNews = +req.params.id || -1;
    //get data
    var dataNews = await newspaperModel.view_detail(idNews);
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
    res.render("vwAccount/admin/newspaper_update",
        {
            nameTags, cats, catid, topic,
            layout: req.session.authUser.roleid == 1 ? 'admin_dashboard' : 'writer_dashboard',
            images,
            dataNews: dataNews[0],
            idNews, img: user[0]['img'],
            username: user[0]['username'],
        });
});

router.post("/news/update/:id", restrict, upload.single('avatar'), async function (req, res) {
    const idUser = req.session.authUser.id;
    const idNews = +req.body.id || -1;
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
    res.redirect('/account/admin/view/newspaper/upload_avatar');

});
module.exports = router;

