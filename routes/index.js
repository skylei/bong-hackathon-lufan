var passport = require('passport'),
    util = require('util'),
    User = require('../models/user.js'),
    Monster = require('../models/monster.js'),
    request = require("request"),
    moment = require("moment"),
    BongStrategy = require('passport-bong').Strategy;


// BONG CONF
var BONG_CLIENT_ID = '1401421720575';
var BONG_CLIENT_SECRET = '86b52a0b5b2a45e3ab10b29622bb704f';
var BONG_HOST = 'http://open-test.bong.cn';
var BONG_TOKEN_URL = BONG_HOST + '/oauth/token';
var BONG_AUTHORIZATION_URL = BONG_HOST + '/oauth/authorize';
var BONG_USERPROFILE_URL = BONG_HOST + '/1/userInfo/{$uid}';


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
            callbackURL: "/auth/bong/callback"
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
    ))
    ;


//跳转到授权页面
    app.get('/auth/bong',
        passport.authenticate('bong'),
        function (req, res) {
            // The request will be redirected to bong for authentication, so this
            // function will not be called.
        });

//授权成功后回调页面
    app.get('/auth/bong/callback',
        passport.authenticate('bong', { failureRedirect: '/auth/bong' }),
        function (req, res) {
            // Successful authentication, redirect home.

            res.redirect('/all');
        });

//获取攻击者和被攻击者信息
    app.get('/attack/muid=:muid/yuid=:yuid',
        function (req, res) {
            var muid = req.params.muid,
                yuid = req.params.yuid,
                mMonster,
                yMonster,
                Monsters = {"me": {}, "you": {}};
            Monster.getMonsterByuID(muid, function (err, monster) {
                if (err || !monster) {
                    return res.send({"err": 0});
                }
                mMonster = monster;
                Monster.getMonsterByuID(yuid, function (err, monster) {
                    if (err || !monster) {
                        return res.send({"err": 0});
                    }
                    yMonster = monster;
                    Monsters.me = mMonster;
                    Monsters.you = yMonster;
                    res.json(Monsters);
                });
            });

        });

    //攻击空白页面
    app.get('/attack',
        function (req, res) {
            res.render("/attack", {});
        });

    app.get('/all',
        function (req, res) {
            User.getUserByuID(req.user.uid, function (err, user) {
                if (err || !user) {
                    res.render('profile', {
                        name: "null"
                    });
                }

                if (!user.mid || user.mid == null) {
                    return res.redirect("/monster");
                }
                //通过ID获取怪兽信息
                Monster.getMonsterBymID(user.mid, function (err, monster) {
                    //console.log(user.name);
                    //console.log(monster.name);
                    res.render("all", {
                        myuID: req.user.uid
                    });
                });

            });

        });


    //获取战斗信息并给赢得一方增加经验值
    app.post('/addExp/muid=:muid/yuid=:yuid',
        function (req, res) {
            var muid = req.params.muid,
                yuid = req.params.yuid,
                resultFight = req.body.final;

            console.log(muid);
            console.log(yuid);
            console.log(resultFight);
            //var resultFight = req.body.fightCode;
            //0代表我方赢得胜利，1代表对方赢得胜利
            if (resultFight == 0) {
                Monster.getMonsterByuID(muid, function (err, monster) {
                    Monster.updateMonsterByuID(muid, {exp: monster.exp + 10}, function () {
                        if (err) {
                            return res.send({"err": 0});
                        }
                        return res.send({"err": 1});
                    });
                });
            } else {
                Monster.getMonsterByuID(yuid, function (err, monster) {
                    Monster.updateMonsterByuID(yuid, {exp: monster.exp + 10}, function () {
                        if (err) {
                            return res.send({"err": 0});
                        }
                        return res.send({"err": 1});
                    });
                });
            }
        });

//个人信息页面
    app.get('/profile',
        function (req, res) {
            User.getUserByuID(req.user.uid, function (err, user) {
                if (err || !user) {
                    res.render('profile', {
                        name: "null"
                    });
                }
                if (!user.mid || user.mid == null) {
                    return res.redirect("/monster");
                }
                //通过ID获取怪兽信息
                Monster.getMonsterBymID(user.mid, function (err, monster) {
                    console.log(user.name);
                    console.log(monster);
                    res.json({
                        name: user.name,
                        monsterName: monster.name,
                        monsterHp: monster.hp,
                        monsterAtk: monster.atk
                    });
                });

            });
        });

//搜索页面
    app.get('/search',
        function (req, res) {
            res.render('search', {
            });
        });

    //获取所有用户信息
    app.get('/search/getAllUsers',
        function (req, res) {
            var objUsers,
                objMonsters,
                objJson = {"userinfo": {}, "monster": {}},
                obj = [],
                newObj = [];
            User.getAllUsers(function (err, users) {
                objUsers = users;
            });
            Monster.getAllMonsters(function (err, monsters) {
                objMonsters = monsters;

                for (var i = 0; i < objUsers.length; i++) {
                    if (req.user.uid != objUsers[i].uid) {

                        var userinfo = objUsers[i],
                            monster = objMonsters[i];
                        objJson.userinfo = userinfo;
                        objJson.monster = monster;
                        obj.push(objJson);
                        objJson = {};
                        console.log(obj);
                    }
//                    console.log(newObj);
                }
                res.json(obj);

            });
            console.log("1");
        });


    //创建怪兽
    app.get('/monster',
        function (req, res) {
            res.render('monster', {
//                date: moment().subtract('days', 1).format("YYYYMMDD")
            });
        });

    //签到
    app.get('/register',
        function (req, res) {
//签到成功返回1，签到失败返回0
            Monster.getMonsterByuID(req.user.uid, function (err, monster) {
                console.log(moment());
                if (monster.register == null || moment(monster.register).dayOfYear() < moment().dayOfYear()) {
                    User.getUserByuID(req.user.uid, function (err, user) {
                        var url = BONG_HOST + "/1/bongday/dailysum/" + moment().subtract('days', 1).format("YYYYMMDD") + "?uid=" + user.uid + "&access_token=" + user.token;
                        console.log(url);
                        request({
                            url: url,
                            json: true
                        }, function (error, response, data) {

                            if (!error && response.statusCode === 200) {
                                console.log(data); // Print the json response
                                var newMonster = {
                                    hp: monster.hp + data.value.sleepNum,
                                    atk: monster.atk + (data.value.calories / 100),
                                    register: moment()
                                };
                                //存储怪兽信息初始化
                                Monster.updateMonsterByuID(req.user.uid, newMonster, function (err, monster) {
                                    if (err) {
                                        return res.send({"err": 0});
                                    }
                                    return res.send({"err": 1});
                                });
                            }
                        })
                    });
                } else {
                    res.send({"err": 0});
                }


            });
        });

    app.post('/monster',
        function (req, res) {
            var monsterName = req.body.name;
            User.getUserByuID(req.user.uid, function (err, user) {
                var url = BONG_HOST + "/1/bongday/dailysum/" + moment().subtract('days', 1).format("YYYYMMDD") + "?uid=" + user.uid + "&access_token=" + user.token;
                console.log(url);
                request({
                    url: url,
                    json: true
                }, function (error, response, data) {

                    if (!error && response.statusCode === 200) {
                        console.log(data); // Print the json response
                        var newMonster = {
                            name: monsterName,
                            sex: 1,
                            birthday: moment(),
                            hp: data.value.sleepNum,
                            atk: data.value.calories / 100,
                            uid: req.user.uid
                        };
                        //存储怪兽信息初始化
                        Monster.save(newMonster, function (err, monster) {
                            if (err) {
                                return res.redirect("/monster");
                            }
                            User.updateUserByuID(req.user.uid, {mid: monster._doc._id}, function (err, user) {
                                //成功跳转到个人页面
                                if (err) {
                                    return res.redirect("/monster");
                                }
                                res.redirect("/all");
                            });
                        });
                    }
                })
            });
        });


};
