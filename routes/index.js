var passport = require('passport'),
    util = require('util'),
    User = require('../models/user.js'),
    Bong = require('../models/bong.js'),
    Rank = require('../models/rank.js'),
    Msg = require('../models/msg.js'),
    request = require("request"),
    moment = require("moment"),
    BongStrategy = require('passport-bong').Strategy;

// BONG CONF
var BONG_CLIENT_ID = '1403270913261';// '1401421720575';
var BONG_CLIENT_SECRET = '34fad8398f5440d6a194e4d85c508a7d';//'86b52a0b5b2a45e3ab10b29622bb704f';
var BONG_HOST = 'http://open-test.bong.cn';
var BONG_TOKEN_URL = BONG_HOST + '/oauth/token';
var BONG_AUTHORIZATION_URL = BONG_HOST + '/oauth/authorize';
var BONG_USERPROFILE_URL = BONG_HOST + '/1/userInfo/{$uid}';
var BONG_USERLOGO_URL = BONG_HOST + '/1/userInfo/avatar/{$uid}';

module.exports = function (app) {
    app.get('/', function (req, res) {
        if (!req.user) {
            res.redirect('/auth/bong');
        } else {
            res.redirect('/all');
        }
    });

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });


    passport.use(new BongStrategy({
            authorizationURL: BONG_AUTHORIZATION_URL,
            userProfileURL: BONG_USERPROFILE_URL,
            tokenURL: BONG_TOKEN_URL,
            clientID: BONG_CLIENT_ID,
            clientSecret: BONG_CLIENT_SECRET,
            callbackURL: "/auth/bong/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                //判断是否存在用户
                User.getUserByuID(profile.uid, function (err, user) {
                    if (!user || err) {
                        var newUser = {
                            "name": profile.name,
                            "gender": profile.gender,
                            "birthday": profile.birthday,
                            "weight": profile.weight,
                            "height": profile.height,
                            "targetSleepTime": profile.targetSleepTime,
                            "targetCalorie": profile.targetCalorie,
                            "token": accessToken,
                            "uid": profile.uid
                        };
                        //存储用户信息
                        User.save(newUser, function (err, user) {
                            return done(err, profile);
                        });
                    } else {
                        return done(err, profile);
                    }
                });
            });
        }
    ));


//跳转到授权页面
    app.get('/auth/bong', passport.authenticate('bong'), function (req, res) {
    });

//授权成功后回调页面
    app.get('/auth/bong/callback', passport.authenticate('bong', { failureRedirect: '/auth/bong' }), function (req, res) {
        var rankInfo={
            'uid': req.user.uid,
            'rank': 0,
            'exp': 0,
            'time':moment(),
        };

        //save rank for first time
        Rank.save(rankInfo,function (err,rank){
            if(!err){

            }else{
                console.log(err);
            }
        });

        res.redirect('/all');
    });

//all of app
    app.get('/all', function (req, res) {
        User.getUserByuID(req.user.uid, function (err, user) {
            if (!err || user) {
                //res.json(user);
                res.render('all', {myuID: user.uid});
            }
        });
    });

//get logo
    app.get('/logo', function (req, res){
        User.getUserByuID( req.user.uid, function (err,user){
                
            var url = BONG_HOST + "/1/userInfo/avatar/" + user.uid + "?access_token=" + user.token;
            request({
                url: url,
                json: true
            }, function (error, response, data) {
                if (!error && response.statusCode === 200) {
                    res.json(data.value); // Print the json response
                }else{
                    res.json(null);
                }
            });
        });
    });

//get user
    app.get('/user',function (req, res){
        User.getUserByuID( req.user.uid, function (err,user){
            if(!err && user){
                res.json(user);
            }else{
                console.log('error');
            }    
        });
    });

//check register
    app.get('/check/register',function (req, res){
        Bong.getBongByUid(req.user.uid, function (err, bong) {
            //check if you have regisiter today
            if( bong!=undefined ){//have bong data, check if timeout
                if (moment(bong.register).dayOfYear() < moment().dayOfYear()) {
                    res.json({"result":false});
                }else{
                    res.json({"result":true});
                }
            }else{//not have bong data, check if 
                res.json({"result":false});
            }
                
        });
    });

//register
    app.get('/register',function (req, res){
        //get bong day message
        User.getUserByuID(req.user.uid,function(err, user){
            var url = BONG_HOST + "/1/bongday/dailysum/" + moment().subtract('days', 1).format("YYYYMMDD") + "?uid=" + user.uid + "&access_token=" + user.token;
            request({
                url: url,
                json: true,
            }, function (error, response, data) {
                if (!error && response.statusCode === 200) {
                    // Print the json response
                    //console.log(data);
                    // save json 
                    data.value.uid = req.user.uid;
                    data.value.register = moment();
                    
                    //remove old data
                    Bong.removeBong({'uid':req.user.uid},function (err, bong){
                        if(!err){

                        }else{
                            console.log(err);
                        }
                    }); 
                    //save new data
                    Bong.save(data.value,function(err,callback){
                        if(!err){
                            Rank.updateRank({"uid":req.user.uid},{"fightTimes":4},function (err, rank){
                                if(!err){
                                    res.json({'result':true});
                                }else{
                                    res.json({'result':false});
                                }
                            });
                        }else{
                            console.log(err);
                            res.json({'result':false});
                        }
                    });
                }
            });
        });
    });

//get bong today
    app.get('/bong', function (req, res){
        var args={
            'uid': req.user.uid,
        }
        Bong.getBong(args, function (err, bong) {
            res.json(bong);
        });  
    });

//add message
    app.post('/add/message/msg=:msg/parent=:parent', function (req, res){
        var parent ;//= req.params.parent ? req.params.parent : 'null';
        var args = {
            'uid': req.user.uid,
            'msg': req.params.msg,
            'parent': parent,
            'time': moment(),
        };

        Msg.save(args,function (err,msg){
            if(!err){
                res.json({'result':true});
            }else{
                res.json({'result':false});
            }
        });
    });

//get message
    app.get('/get/msg', function (req, res){
        Msg.getMsg({},function (err, msg){
            if(!err){
                res.json(msg);
            }else{
                res.json(false);
            }    
        });
    });

//update rank and exp
    app.post('/update/rank/exp=:exp/fightTimes=:fightTimes', function (req, res){
        Rank.getRank({'uid': req.user.uid}, function (err, ranks){
            if(!err){
                ranks=ranks[0];
                var updateInfo = {
                    'fightTimes': req.params.fightTimes,
                    'exp': Number(ranks.exp) + Number(req.params.exp),
                };
                console.log(updateInfo);
                Rank.updateRank({'uid': req.user.uid}, updateInfo, function (err, rank){
                    if(!err){
                        res.json({'result':true});
                    }else{
                        console.log(err);
                        res.json({'result':false});
                    }
                });
            }else{
                console.log(err);
            }
        });
    });

//minus fight times
    /*app.post("/minus/fightTimes", function (req, res){

    });*/

//get rank and exp
    app.get('/get/rank', function (req, res){
        
        var myrank;
        var count = 1;//my rank
        var allCount = 0;//all count

        Rank.getRank({'uid': req.user.uid},function (err, myranks){
            if(!err && myranks){
                myrank = myranks[0];                
            }else{
                console.log(err);
            }
        });

        Rank.getRank({},function (err,ranks){
            
            ranks.forEach(function (r){
                allCount++;
                //add my rank +1
                if( r.exp > myrank.exp ){
                    count++;
                }
            });
            
            Rank.updateRank({'uid': req.user.uid}, {'rank': count}, function (err,updaterank){
                if(!err && updaterank){
                    Rank.getRank({'uid': req.user.uid},function (err,getrank){
                        //console.log(getrank);
                        if(!err && getrank){
                            var rankPersonal = getrank[0];
                            //rankPersonal[1]=({"number":allCount});
                            //console.log(rankPersonal);
                            res.json(rankPersonal);
                        }else{
                            console.log(err);
                        }
                    });
                }else{
                    console.log(err);
                }
            });
        }); 
    });     

};
