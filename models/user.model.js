const db = require('../utils/db');

const TBL_USERS = 'user';

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_USERS}`);
  },
  email: function () {
    return db.load(`select email from ${TBL_USERS}`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_USERS}`);
  },
  lengthall_offset: function (roleid) {
    return db.load(`select count(*) from ${TBL_USERS} where if(${roleid}>=0,roleid=${roleid},1) `);
  },
  all_offset: function (roleid,limit,offset) {
    return db.load(`select * from ${TBL_USERS} where if(${roleid}>=0,roleid=${roleid},1) LIMIT ${offset}, ${limit}`);
  },
  single: function (email) {
    return db.load(`select * from ${TBL_USERS} where email = '${email}'`);
  },
  
  single_id: function (id) {
    return db.load(`select * from ${TBL_USERS} where id = '${id}'`);
  },
  login: function (email,password) {
    return db.load(`select * from ${TBL_USERS} where email = '${email}' and password='${password}'`);
  },
  add: function (entity) {
    return db.add(TBL_USERS, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.id;
    return db.patch(TBL_USERS, entity, condition);
  },
  del: function (id) {
    const condition = { id }
    return db.del(TBL_USERS, condition);
  },

  //writer 
  maxview:function(id)  
  {
    return db.load(`SELECT MAX(n.view) as view FROM newspaper n JOIN user u on u.id= n.writerid WHERE n.isdelete = 0 and n.writerid=${id} `)
  },
  totalcomment:function(id)
  {
    return db.load(`SELECT COUNT(DISTINCT c.stt)  as comment FROM newspaper n JOIN user u on u.id= n.writerid join comment c on c.newspaperid = n.id WHERE n.isdelete = 0 and n.writerid=${id} `)
  },
  totalnew:function(id)
  {
    return db.load(`SELECT COUNT(DISTINCT n.id) as new FROM newspaper n JOIN user u on u.id= n.writerid WHERE n.isdelete = 0 and n.writerid=${id}`)
  }

  

};
