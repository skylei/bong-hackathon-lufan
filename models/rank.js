var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var RankSchema = new Schema({
    uid: String,
    exp: Number,
    rank: Number,
    fightTimes:Number,
    time: {type: Date, default: null}
});

var Rank = mongodb.mongoose.model("Rank", RankSchema);

var RankDAO = function () {
};

//存入用户信息
RankDAO.prototype.save = function (rankInfo, callback) {
    //要存入数据库的用户信息文档
    var newRank = {
        uid: rankInfo.uid,
        exp: rankInfo.exp,
        rank: rankInfo.rank,
        time: rankInfo.time,
        fightTimes: 4,
    };

    var instance = new Rank(newRank);
    instance.save(function (err, rank) {
        callback(err, rank);
    });
};

RankDAO.prototype.getRank = function (findInfo, callback){
    Rank.find(findInfo,function (err ,rank){
        callback(err,rank);
    });
};

RankDAO.prototype.getRankByUid = function (uid, callback){
    Rank.findOne({'uid': uid},function (err ,rank){
        callback(err,rank);
    });
};

RankDAO.prototype.updateRank = function (findInfo, updateInfo, callback){
    Rank.update(findInfo, updateInfo, function (err, rank){
        callback(err, rank);
    });
};

module.exports = new RankDAO();