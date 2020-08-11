const db = require('../utils/db');


const TBL_TASK='task'

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_TASK}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_TASK} where id = '${id}'`);
  },
  single_data: function (userid,catid) {
    return db.load(`select * from ${TBL_TASK} where iduser = '${userid}' and catid = '${catid}'`);
  },
  single_id_detail: function (iduser) {
    return db.load(`SELECT task.*,category.id as catid,category.name , ifnull(task.iduser,0) AS ischeck FROM category  left join ${TBL_TASK}  on task.catid=category.id AND iduser = '${iduser}'`);
  },
  add: function (entity) {
    return db.add(TBL_TASK, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_TASK, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_TASK, condition);
  }
};
