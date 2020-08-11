const db = require('../utils/db');

const TBL_ROLE_USER = 'role_user';


module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_ROLE_USER}`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_ROLE_USER}`);
  },
  all_offset: function (limit,offset) {
    return db.load(`select * from ${TBL_ROLE_USER} LIMIT ${offset}, ${limit}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_ROLE_USER} where id = '${id}'`);
  },

  add: function (entity) {
    return db.add(TBL_ROLE_USER, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_ROLE_USER, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_ROLE_USER, condition);
  },
  
};
