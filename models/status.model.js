const db = require('../utils/db');

const TBL_STATUS = 'status';

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_STATUS}`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_STATUS}`);
  },
  all_offset: function (limit,offset) {
    return db.load(`select * from ${TBL_STATUS} LIMIT ${offset}, ${limit}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_STATUS} where id = '${id}'`);
  },
  
  add: function (entity) {
    return db.add(TBL_STATUS, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_STATUS, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_STATUS, condition);
  }
};
