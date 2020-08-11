
const topicModel = require('../models/topic.model');

//const categoryModel = require('../models/category.model');

const categoryModel = require('../models/category.model');
const newmodel=require('../models/newspaper.model');



 module.exports = function (app) {
  app.use(async function (req, res, next) {
    const rows = await topicModel.all();
    res.locals.lcTopic = rows;
    next();
  })

  app.use(async function(req, res, next){
    const rows10=await newmodel.randomtop5();
    res.locals.lcNewspaper=rows10;
    next();
  })
  
}
