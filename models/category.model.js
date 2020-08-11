const db = require('../utils/db');

const TBL_CATEGORIES = 'category';
const TBL_TOPIC='topic'

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_CATEGORIES}`);
  },
  all_editor: function (id) {
    return db.load(`select category.* from ${TBL_CATEGORIES} join task on category.id=task.catid where iduser=${id}`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_CATEGORIES}`);
  },
  all_offset: function (limit,offset) {
    return db.load(`select * from ${TBL_CATEGORIES} LIMIT ${offset}, ${limit}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_CATEGORIES} where id = '${id}'`);
  },
  allWithDetails: function () {
    return db.load(`
      select c.*, count(n.id) as num_of_new
      from ${TBL_TOPIC} c left join newspaper n on c.id = n.topicid
      group by c.id, c.name`);
  },
  add: function (entity) {
    return db.add(TBL_CATEGORIES, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_CATEGORIES, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_CATEGORIES, condition);
  }
};
