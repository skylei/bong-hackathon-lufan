bong-hackathon-lufan
====================

> You can ge to official website:  `http://bong.cn/`

#####About

Lufan is a work work on bong hackathon and is based on nodejs,mongodb. We hope you to do more sport and hava fun with the game!Lufan is easy, you just start game and swing your phone, we will calculate your score by gravity sensor !

#####Start

    cd bin
    node www

#####Config

`/router/index.js` :

    // BONG CONF
    var BONG_CLIENT_ID = 'your client id';
    var BONG_CLIENT_SECRET = 'your client secret';
    var BONG_HOST = 'http://open-test.bong.cn';
    var BONG_TOKEN_URL = BONG_HOST + '/oauth/token';
    var BONG_AUTHORIZATION_URL = BONG_HOST + '/oauth/authorize';
    var BONG_USERPROFILE_URL = BONG_HOST + '/1/userInfo/{$uid}';
    var BONG_USERLOGO_URL = BONG_HOST + '/1/userInfo/avatar/{$uid}';
    
`/app.js` include some moduel of project

    var express = require('express');
    var http = require('http');
    var path = require('path');
    var favicon = require('static-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var passport = require('passport');
    var BongStrategy = require('passport-bong').Strategy;
    var SessionStore = require("session-mongoose")(express);
    //
    var routes = require('./routes');
    var store = new SessionStore({
        url: "mongodb://localhost/lu",//this is your database name 
        interval: 120000 // expiration check worker run interval in millisec (default: 60000)
    });
    
`/bin/www` about your port
    
    #!/usr/bin/env node
    var debug = require('debug')('my-application');
    var app = require('../app');
    //
    app.set('port', process.env.PORT || 3003);
    var server = app.listen(app.get('port'), function() {
        debug('Express server listening on port ' + server.address().port);
    });

    
    
    
    
