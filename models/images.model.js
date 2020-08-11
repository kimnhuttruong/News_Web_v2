const db = require('../utils/db');
const TBL_IMAGES = 'images';
const TBL_IMAGESOWNER = 'imageowner';
module.exports = {
    all: function () {
        return db.load(`select * from ${TBL_IMAGES}`);
    },
    single_id: function (id) {
        return db.load(`select * from ${TBL_IMAGES} where id = '${id}'`);
    },
    add: function (entity) {
        return db.add(TBL_IMAGES, entity);
    },
    patch: function (entity) {
        const condition = {
            id: entity.id
        }
        delete entity.CatID;
        return db.patch(TBL_IMAGES, entity, condition);
    },
    del: function (id) {
        const condition = {
            id: id
        }
        return db.del(TBL_IMAGES, condition);
    },
    id: function (name) {
        return db.load(`select id from ${TBL_IMAGES} where name = '${name}'`);
    },
    byUser: function (id) {
        return db.load(`select * from ${TBL_IMAGES} where idUser = ${id} `);
    },
};