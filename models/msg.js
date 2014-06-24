var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var MsgSchema = new Schema({
    uid: String,
    msg: String,
    type: Number,//0 is unread and 1 is read
    parent: String,
    time: {type: Date, default: null}
});

var Msg = mongodb.mongoose.model("Msg", MsgSchema);

var MsgDAO = function () {
};

//存入用户信息
MsgDAO.prototype.save = function (msgInfo, callback) {
    //要存入数据库的用户信息文档
    var newMsg = {
        uid: msgInfo.uid,
        msg: msgInfo.msg,
        type: 0,
        parent: msgInfo.parent,
        time: msgInfo.time,
    };

    var instance = new Msg(newMsg);
    instance.save(function (err, msg) {
        callback(err, msg);
    });
};

MsgDAO.prototype.getMsgByUser = function (findInfo,callback){
    Msg.find( findInfo, function (err, msg) {
        callback(err, msg);
    });
};

MsgDAO.prototype.getMsg = function(findInfo, callback){
    Msg.find(findInfo, function (err, msg){
        callback(err, msg);
    });
}

MsgDAO.prototype.updateMsgToRead = function (findInfo,callback){
    Message.update(findInfo, { $set: {'type':1}}, function (err) {
        callback(err,message);
    });

    /*Message.find( findInfo, function (err, messagess) {
        if (!messagess){
            return next(new Error('Could not load Document'));  
        } else {
            messagess.type = 1;
            messagess.save(function(err) {
                if (err){
                    console.log('error');
                }else{
                    console.log('success');
                }
            });
        }
    });
    */      
};

module.exports = new MsgDAO();