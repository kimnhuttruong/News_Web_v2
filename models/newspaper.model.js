const db = require('../utils/db');
const { container } = require('googleapis/build/src/apis/container');
const TBL_NEWSPAPER = 'newspaper';
const TBL_TOPIC = 'topic'
const TBL_NEWS = 'newspaper';
const TBL_COMMENTS = 'comment';
const TBL_TAGS = 'tag'
const TBL_TN = 'tag_newspaper'

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_NEWS}`);
  },
  all_detail: function () {
    return db.load(`SELECT newspaper.id as id,newspaper.name as name,newspaper.desc,topic.name as topic, category.name AS category ,status.status,newspaper.ispremium,newspaper.time FROM newspaper,topic,category,status where newspaper.topicid=topic.id and category.id=topic.catid and status.id=newspaper.statusid ORDER BY category.name DESC, topic.name DESC,name desc`);
  },
  length: function () {
    return db.load(`select count(*) from ${TBL_NEWS}`);
  },
  length_offset: function (catid,topicid) {
    return db.load(`select count(*) from ${TBL_NEWS} left join topic on newspaper.topicid=topic.id where if(${catid}>=0,topic.catid=${catid},1) and if(${topicid}>=0,topic.id=${topicid},1)`);
  },
  all_offset: function (catid,topicid,limit,offset) {
    return db.load(`SELECT newspaper.id as id,newspaper.name as name,newspaper.desc,topic.name as topic, category.name AS category ,status.status,newspaper.ispremium,newspaper.time FROM newspaper left join topic on newspaper.topicid=topic.id left join category on category.id=topic.catid left join status on status.id=newspaper.statusid where if(${catid}>=0,topic.catid=${catid},1) and if(${topicid}>=0,topic.id=${topicid},1) ORDER BY category.name DESC, topic.name DESC,name desc LIMIT ${offset}, ${limit}`);
  },
  single_id: function (id) {
    return db.load(`select * from ${TBL_NEWS} where id = ${id}`);
  },
  top10Category: function (id) {
    return db.load(`select * from (SELECT a.*,topic.name as t_name FROM newspaper AS a JOIN topic on topic.id=a.topicid WHERE a.statusid=1 and a.time <NOW() and a.time >= all (SELECT b.time FROM newspaper AS b WHERE b.topicid = a.topicid ) ORDER BY a.topicid ASC, a.time DESC) as bang1 WHERE bang1.id >= all (SELECT bang2.id from (SELECT a.id, a.topicid, a.time FROM newspaper AS a WHERE a.statusid=1 and a.time >= all (SELECT b.time FROM newspaper AS b WHERE b.topicid = a.topicid ) ORDER BY a.topicid ASC, a.time DESC) as bang2 WHERE bang1.topicid=bang2.topicid) ORDER BY time desc LIMIT 10`);
  },
  view: function (id,statusid,offset,limit) {
    return db.load(`SELECT n.*,t.name as topic ,c.name as category, c.id as categoryid FROM newspaper n JOIN topic t on n.topicid = t.id join category c on c.id = t.catid where n.isdelete = 0 and  n.writerid =${id} and if(${statusid}>=0,n.statusid=${statusid},1) limit ${offset} ,${limit}`);
  },
  lengthview: function (id,statusid) {
    return db.load(`SELECT count(*) FROM newspaper n JOIN topic t on n.topicid = t.id join category c on c.id = t.catid where n.isdelete = 0 and  n.writerid =${id}  and if(${statusid}>=0,n.statusid=${statusid},1)`);
  },
  view_detail: function (id) {
    return db.load(`SELECT n.*,t.name as topic ,c.name as category, s.status as status FROM newspaper n JOIN topic t on n.topicid = t.id join category c on c.id = t.catid  join status s on s.id = n.statusid  where n.isdelete = 0 and n.id = ${id}`);
  },

  top5: function () {
    return db.load(`select * from ${TBL_NEWS}  ORDER BY view DESC  LIMIT 5;`);
  },
  top5_time: function () {
    return db.load(`select *,user.signature from ${TBL_NEWS},user where newspaper.writerid=user.id ORDER BY time DESC  LIMIT 5;`);
  },
  sumview: function () {
    return db.load(`select sum(view) as view from ${TBL_NEWS} `);
  },
  add: function (entity) {
    return db.add(TBL_NEWS, entity);
  },
  patch: function (entity) {
    const condition = {
      id: entity.id
    }
    delete entity.id;
    return db.patch(TBL_NEWS, entity, condition);
  },
  del: function (id) {
    const condition = { id }
    return db.del(TBL_NEWS, condition);
  },
  // editor
  view_by_category: function (id) {

  },
  view_by_tags: function (id) {
    return db.load(`SELECT n.*,t.name as topic ,c.name as category FROM newspaper n JOIN topic t on n.topicid = t.id join category c on c.id = t.catid where n.isdelete = 0 and  n.tag ='${id}' and ( n.statusid = 4) `);
  },
  ///////////Guest
  slide1: function () {
    return db.load(`select n.*,t.id as t_id, t.name as t_name from ${TBL_NEWS} n join ${TBL_TOPIC} t on n.topicid=t.id
    where n.statusid = 1 and n.time <NOW() AND n.ispremium=0 and TIMESTAMPDIFF(DAY, n.time ,NOW())<7 order by view,time,rand() limit 1,1`);
  },
  slide2: function () {
    return db.load(`select n.*,t.id as t_id,  t.name as t_name from ${TBL_NEWS} n join ${TBL_TOPIC} t on n.topicid=t.id
    where  n.statusid = 1 and n.time <NOW() AND n.ispremium=0 and TIMESTAMPDIFF(DAY, n.time ,NOW())<7 order by view,time,rand() limit 2,1`);
  },
  slide3: function () {
    return db.load(`select n.*,t.id as t_id,  t.name as t_name from ${TBL_NEWS} n join ${TBL_TOPIC} t on n.topicid=t.id
    where n.statusid = 1 and n.time <NOW() AND n.ispremium=0 and TIMESTAMPDIFF(DAY, n.time ,NOW())<7 order by view,time,rand() limit 3,1`);
  },
  top10: function () {
    return db.load(`select n.*,t.id as t_id, t.name as t_name  from ${TBL_NEWSPAPER} n join ${TBL_TOPIC} t 
  on n.topicid=t.id WHERE  n.statusid = 1 and n.time <NOW() order by  time DESC limit 10`);
  },
  randomtop5: function () {
    return db.load(`SELECT n.*,t.id as t_id, t.name as t_name from ${TBL_NEWSPAPER} n join ${TBL_TOPIC} t on n.topicid=t.id
    WHERE topicid = 1 ORDER by rand() LIMIT 5`)
  },
  cardview: function () {

    return db.load(`select n.id as n_id, n.name as n_name, n.desc as n_desc, n.view as n_view, n.time as n_time,t.id as t_id, t.name as t_name  from ${TBL_NEWSPAPER} n join ${TBL_TOPIC} t 
      on n.topicid=t.id order by  time DESC limit 2`);

  },
  cardviewright: function () {
    return db.load(`select n.*, t.name as t_name, t.id as t_id  
    from ${TBL_NEWSPAPER} n join ${TBL_TOPIC} t on n.topicid=t.id  WHERE n.statusid = 1 and n.time <NOW()
    order by rand() limit 6 `);
  },
  popularnew: function () {
    return db.load(`select n.id as n_id, n.name as n_name, n.desc as n_desc, n.time as n_time,n.view as n_view, t.id as t_id, t.name as t_name ,n.* 
      from ${TBL_NEWSPAPER} n join ${TBL_TOPIC} t 
      on n.topicid=t.id WHERE n.statusid = 1 and n.time <NOW() order by  view DESC limit 10`);
  },

  allByCat: function (topicid) {
    return db.load(`select * from ${TBL_NEWSPAPER} where topicid = ${topicid}`);
  },
  pageByCat: function (topicid, limit, offset) {
    return db.load(`select n.* from ${TBL_NEWSPAPER} n join topic t on n.topicid = t.id where topicid = ${topicid} limit ${limit} offset ${offset}`);
  },
  pageByCat_Topic: function (topicid,catid, offset,limit) {
    
    return db.load(`select n.*,t.name as topic ,u.signature as writer, COUNT(*) as comment  from ${TBL_NEWSPAPER} n join topic t on n.topicid = t.id left JOIN user u on n.writerid = u.id left join comment c on n.id = c.newspaperid  where if(${catid}>=0,t.catid=${catid},1) and if(${topicid}>=0,t.id=${topicid},1) and  n.statusid = 1  GROUP BY n.id  limit ${offset} ,${limit}`);
  },
  lengthpageByCat_Topic: function (topicid,catid) {
    return db.load(`select COUNT( DISTINCT n.id) as count  from ${TBL_NEWSPAPER} n join topic t on n.topicid = t.id left JOIN user u on n.writerid = u.id left join comment c on n.id = c.newspaperid  where if(${catid}>=0,t.catid=${catid},1) and if(${topicid}>=0,t.id=${topicid},1) and  n.statusid = 1   `);
  },
  pageByTag: function (tagid, limit, offset) {
    return db.load(`SELECT n.* from ${TBL_NEWSPAPER} n JOIN ${TBL_TN} tn on tn.newspaperid=n.id JOIN ${TBL_TAGS} t on t.id=tn.tagid 
    WHERE t.id=${tagid} limit ${limit} offset ${offset}`)
  },
  countByTag: async function(tagid){
    const rows= await db.load(`SELECT COUNT( DISTINCT n.id) as total from ${TBL_NEWSPAPER} n JOIN ${TBL_TN} tn on tn.newspaperid=n.id JOIN ${TBL_TAGS} t on ${tagid}=tn.tagid 
    WHERE t.id=${tagid}`); 
    return rows[0].total;
  },
  countByCat: async function (topicid) {
    const rows = await db.load(`select count(*) as total from ${TBL_NEWSPAPER} where topicid = ${topicid}`);
    return rows[0].total;
  },
  single: function (id) {
    return db.load(`select n.*,t.id as t_id, t.name as tag, if(user.username != NULL   OR user.username !='' ,user.username,N'ẩn danh') as writer from ${TBL_NEWSPAPER} n left join ${TBL_TN} tg on n.id=tg.newspaperid left join ${TBL_TAGS} t on tg.tagid=t.id left join user as user on user.id=n.writerid
     where n.id = ${id}`);
  },
  view_by_task(id,catid, topicid,start)
  {
      return db.load(`SELECT n.*,t.name as topic ,c.name as category FROM newspaper n JOIN topic t on n.topicid = t.id join category c on c.id = t.catid JOIN task ta on ta.catid = c.id left JOIN user u on u.id = ta.iduser where n.isdelete = 0  and if(${catid}>=0,t.catid=${catid},1) and if(${topicid}>=0,t.id=${topicid},1) and  u.id = ${id} and  n.statusid = 4 LIMIT ${start}, 10`)
  },
  lengthview_by_task(id,catid, topicid)
  {
      return db.load(`SELECT count(*) FROM newspaper n JOIN topic t on n.topicid = t.id join category c on c.id = t.catid JOIN task ta on ta.catid = c.id JOIN user u on u.id = ta.iduser where  n.isdelete = 0 and if(${catid}>=0,t.catid=${catid},1) and if(${topicid}>=0,t.id=${topicid},1) and  u.id = ${id} and  n.statusid = 4`)/// 
  },
  pageByTag: function (tagid, limit,offset) {
    return db.load(`select n.*,u.signature as writer, COUNT(*) as comment  from ${TBL_NEWSPAPER} n left JOIN user u on n.writerid = u.id join tag_newspaper tn on tn.newspaperid = n.id   left join comment c on n.id = c.newspaperid  where  tn.tagid =${tagid} and  n.statusid = 1  GROUP BY n.id  limit ${offset} ,${limit}`);
  },
  lengthpageByTag: function (tagid) {
    return db.load(`select COUNT(n.id) as count  from ${TBL_NEWSPAPER} n left JOIN user u on n.writerid = u.id join tag_newspaper tn on tn.newspaperid = n.id   left join comment c on n.id = c.newspaperid  where  tn.tagid =${tagid} and  n.statusid = 1    `);
  },
  byUser: function (idUser) {
    return db.load(`select * from ${TBL_NEWSPAPER} where writerid = ${idUser}`);
  },
  getIdLast: function (idUser) {
    return db.load(`select max(id) as id from ${TBL_NEWSPAPER} where writerid = ${idUser} ORDER BY time desc`);
  },
  updateAvatar:function(id,avatar){
    return db.load(`update ${TBL_NEWSPAPER} set avatar = '${avatar}' where id = ${id}`);
  },
  updateAvatarBigSize:function(id,avatar){
    return db.load(`update ${TBL_NEWSPAPER} set avatar_bigsize = '${avatar}' where id = ${id}`);
   },
  // fulltextsearchfull(search){
  //   return db.load(`
  //   SELECT a.*,b.username as writer ,MATCH (a.name,a.detail) AGAINST('${search}' IN BOOLEAN MODE) as score
  //   FROM ${TBL_NEWSPAPER}  as a join user as b on a.writerid = b.id
  //   ORDER BY score DESC
  //   limit 10`);
  // },
  lengthfulltextsearchfull(search){
    return db.load("SELECT count(*)  FROM newspaper  as a left join user as b on a.writerid = b.id  WHERE MATCH (`name`,`desc`,`detail`) AGAINST(N'"+search+"' IN BOOLEAN MODE)");
  },
  fulltextsearchfull(search, limit,offset){
    return db.load("SELECT a.*,b.username as writer  FROM newspaper  as a left join user as b on a.writerid = b.id   where MATCH (`name`,`desc`,`detail`) AGAINST('"+search+"' IN BOOLEAN MODE)  limit "+offset+" ,"+limit);
  },
}



