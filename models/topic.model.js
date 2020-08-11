const db = require('../utils/db');

const TBL_CATEGORIES = 'category';
const TBL_TOPIC='topic'

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_TOPIC}`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_TOPIC} `);
  },
  lengthall_offset: function (catid) {
    return db.load(`select count(*) from ${TBL_TOPIC} where if(${catid}>=0,catid=${catid},1)`);
  },
  all_offset: function (catid,limit,offset) {
    return db.load(`SELECT topic.id,category.name as category,topic.name AS topic FROM category JOIN topic on category.id=topic.catid where if(${catid}>=0,catid=${catid},1) LIMIT ${offset}, ${limit}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_TOPIC} where id = '${id}'`);
  },
  single_catid: function (id) {
    return db.load(`select * from ${TBL_TOPIC} where catid = '${id}'`);
  },
  allWithDetails: function () {
    return db.load(`
    SELECT topic.id,category.name as category,topic.name AS topic FROM category JOIN topic on category.id=topic.catid`);
  },
  add: function (entity) {
    return db.add(TBL_TOPIC, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_TOPIC, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_TOPIC, condition);
  }
};
