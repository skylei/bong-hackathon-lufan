var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
    mid: String,
    name: String,
    gender: Number,
    birthday: Number,
    weight: Number,
    height: Number,
    targetSleepTime: Number,
    targetCalorie: Number,
    head: String,
    token: String,
    create: Date,
    uid: String
});

var User = mongodb.mongoose.model("User", UserSchema);

var UserDAO = function () {
};

//存入用户信息
UserDAO.prototype.save = function (user, callback) {
    //要存入数据库的用户信息文档
    var newUser = {
        mid: user.mid,
        name: user.name,
        gender: user.gender,
        birthday: user.birthday,
        weight: user.weight,
        height: user.height,
        targetSleepTime: user.targetSleepTime,
        targetCalorie: user.targetCalorie,
        head: user.head,
        token: user.token,
        create: new Date(),
        uid: user.uid
    };
    var instance = new User(newUser);
    instance.save(function (err, user) {
        callback(err, user);
    });
};

UserDAO.prototype.getAllUsers = function (callback) {
    User.find({}, function (err, users) {
        callback(err, users);
    });
};

UserDAO.prototype.getUserByuID = function (ID, callback) {
    User.findOne({uid: ID}, function (err, user) {
        callback(err, user);
    });
};

UserDAO.prototype.updateUserByuID = function (ID, user, callback) {
    User.update({uid: ID}, user, function (err, user) {
        callback(err, user);
    });
};


module.exports = new UserDAO();