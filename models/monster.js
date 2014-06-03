var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var MonsterSchema = new Schema({
    name: String,
    sex: Number,
    birthday: Date,
    level: Number,
    hp: Number,
    atk: Number,
    uid: String,
    exp: {type: Number, default: 0},
    register: {type: Date, default: null}
});

var Monster = mongodb.mongoose.model("Monster", MonsterSchema);

var MonsterDAO = function () {
};

//存入用户信息
MonsterDAO.prototype.save = function (monster, callback) {
    //要存入数据库的用户信息文档
    var newMonster = {
        name: monster.name,
        sex: monster.sex,
        birthday: monster.birthday,
        hp: monster.hp,
        atk: monster.atk,
        uid: monster.uid,
        register: new Date()
    };

    var instance = new Monster(newMonster);
    instance.save(function (err, monster) {
        callback(err, monster);
    });

};

MonsterDAO.prototype.updateMonsterByuID = function (ID, monster, callback) {
    Monster.update({uid: ID}, monster, function (err, monster) {
        callback(err, monster)
    });
};

//通过ID获取宠物信息
MonsterDAO.prototype.getMonsterBymID = function (ID, callback) {
    Monster.findOne({_id: ID}, function (err, monster) {
        callback(err, monster);
    });
};

//通过uID获取宠物信息
MonsterDAO.prototype.getMonsterByuID = function (ID, callback) {
    Monster.findOne({uid: ID}, function (err, monster) {
        callback(err, monster);
    });
};


MonsterDAO.prototype.getAllMonsters = function (callback) {
    Monster.find({}, function (err, monsters) {
        //console.log(monsters);
        callback(err, monsters);
    })
};

module.exports = new MonsterDAO();