const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser')
const app = express();

app.use(express.urlencoded({
  extended: true
}));
app.use('/public', express.static('public'));

// parse application/json
app.use(bodyParser.json())

require('./middlewares/session.mdw')(app);
require('./middlewares/view.mdw')(app);
require('./middlewares/locals.mdw')(app);


// app.get('/', function (req, res) {
//    res.send('hello expressjs');
//   // res.render('_home');
// })

app.get('/category', function (req, res) {
  // res.send('hello expressjs');
  res.render('catagories_post');
})
app.get('/category/:id', function (req, res) {
  // res.send('hello expressjs');
  res.render('single_post');
})



//app.use('/account', require('./routes/account.route'))

// app.get('/about', function (req, res) {
//   res.render('about');
// })
// app.get('/notAuthentication', function (req, res) {
//   res.render('notAuthentication',{layout: false});
// })

app.use('/', require('./routes/home.route'))
app.use('/account', require('./routes/account.route'))
// app.use('/writer', require('./routes/writer.route'))
// app.use('/editor', require('./routes/editor.route'))
// app.use('/subscriber', require('./routes/subscriber.route'))
app.use('/newspaper', require('./routes/_newspaper.route'));
// app.use('/admin/categories', require('./routes/category.route'));
app.get('/err', function (req, res) {
  throw new Error('beng beng');
})

app.use(function (req, res) {
  res.render('404', { layout: false });
})

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('500', { layout: false });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server is running at http://localhost:${PORT}`);
})