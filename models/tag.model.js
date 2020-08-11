const db = require('../utils/db');

const TBL_TAGS = 'tag';


module.exports = {
  all_tag: function () {
    return db.load(`select * from ${TBL_TAGS}`);
  },
  all: function (id) {
    return db.load(`SELECT t.* FROM tag t JOIN tag_newspaper tn on t.id = tn.tagid WHERE tn.newspaperid = ${id}`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_TAGS}`);
  },
  all_offset: function (limit,offset) {
    return db.load(`select * from ${TBL_TAGS} LIMIT ${offset}, ${limit}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_TAGS} where id = '${id}'`);
  },

  add: function (entity) {
    return db.add(TBL_TAGS, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_TAGS, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_TAGS, condition);
  },
  singleByTagName: async function(name){
    const rows = await db.load(`select * from ${TBL_TAGS} where name = '${name}'`);
    if (rows.length === 0)
      return null;

    return rows[0];
  },
  idByName:function(name){
    return db.load(`select id from ${TBL_TAGS} where name = '${name}'`);
     
  },
  nameById:function(id){
    return db.load(`select name from ${TBL_TAGS} where id = ${id}`);
     
  },
};
