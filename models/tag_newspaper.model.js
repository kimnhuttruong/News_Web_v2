const db = require('../utils/db');

const TBL_TN = 'tag_newspaper';


module.exports = {
  all: function (id) {
    return db.load(`SELECT t.* FROM tag t JOIN tag_newspaper tn on t.id = tn.tagid WHERE tn.newspaperid = ${id}`);
  },
  alltags: function () {
    return db.load(`SELECT t.* FROM tag t JOIN tag_newspaper tn on t.id = tn.tagid LIMIT 0, 10`);
  },
  add: function (entity) {
    return db.add(TBL_TN, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.CatID;
    return db.patch(TBL_TN, entity, condition);
  },
  del: function (id) {
    const condition = {
      id: id
    }
    return db.del(TBL_TN, condition);
  },
  delOldRelation: function (tagid, newspaperid) {
    return db.load(`delete from ${TBL_TN} where tagid = ${tagid} and newspaperid = ${newspaperid}`);
  },
  byNews: function(id){
    return db.load(`select tag.id, tag.name from tag_newspaper left join tag on tag.id=tag_newspaper.tagid where tag_newspaper.newspaperid = ${id} and tag_newspaper.isdelete = 0`);
  }
};
