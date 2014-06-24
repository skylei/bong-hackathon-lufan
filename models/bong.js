var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var BongSchema = new Schema({
    uid: String,
    calories: Number,
    steps: Number,
    distance: Number,
    stillTime: Number,
    sleepNum: Number,
    dsNum: Number,
    sleepTimes: Number,
    complete: Number,
    date: String,
    register: Date,
});

var Bong = mongodb.mongoose.model("Bong", BongSchema);

var BongDAO = function (){};

BongDAO.prototype.save = function (saveInfo, callback) {
    var bongData = {
        uid: saveInfo.uid,
        calories: saveInfo.calories,
        steps: saveInfo.steps,
        distance: saveInfo.distance,
        stillTime: saveInfo.stillTime,
        sleepNum: saveInfo.sleepNum,
        dsNum: saveInfo.dsNum,
        sleepTimes: saveInfo.sleepTimes,
        complete: saveInfo.complete,
        date: saveInfo.date,
        register: saveInfo.register,
    };

    var instance = new Bong(bongData);
    instance.save(function (err, data) {
        callback(err, data);
    });
};

BongDAO.prototype.getBongByUid = function(uid, callback){
    Bong.find({ 'uid' : uid},function (err, bong){
        if( typeof(bong[0])==undefined ){
            callback(err,bong);
        }else{
            callback(err,bong[0]);
        }
    });
}

//update bong for register
BongDAO.prototype.update = function(updateInfo, updateMsg, callback){
    Bong.update(updateInfo, updateMsg, function (err,bong){
        callback(err,bong);
    });
}

BongDAO.prototype.removeBong = function(deleteInfo,callback){
    Bong.remove(deleteInfo, function (err,bong){
        callback(err,bong);
    });
}

BongDAO.prototype.getBong = function(bongInfo,callback){
    Bong.find(bongInfo,function(err,bong){
        callback(err,bong);
    });
}

module.exports = new BongDAO();