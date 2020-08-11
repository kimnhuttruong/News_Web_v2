
const db = require('../utils/db');

const TBL_COMMENTS = 'comment';
const TBL_USERS = 'user';
module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_COMMENTS}`);
  },
  top5: function () {
    return db.load(`SELECT count(cm.stt) as sum_cm,np.name,np.id from newspaper np join COMMENT cm WHERE np.id=cm.newspaperid group by cm.newspaperid,np.desc`);
  },
  add: function (entity) {
    return db.add(TBL_COMMENTS, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.id;
    return db.patch(TBL_COMMENTS, entity, condition);
  },
  del: function (id) {
    const condition = { id }
    return db.del(TBL_COMMENTS, condition);
  },
  byNewspaper:function(id){
    const condition = { id }
    return db.load(`select * from ${TBL_COMMENTS} c, ${TBL_USERS} u where c.userid = u.id and newspaperid = ${id}`);
  },
  countComment: function(newid){
    return db.load(`SELECT count(cm.stt) as sum_comment,np.name,np.id from newspaper np join ${TBL_COMMENTS} cm on np.id=${newid} 
    where cm.newspaperid=${newid}`);
  }
};
