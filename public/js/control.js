$(document).ready(function() {
    //for fight 
        var result = '';
        var throw_times=0;
        var goal=0;
    
        function Orientation(selector) {
                
        }
                
        Orientation.prototype.init = function(){
            throw_times=0;
            goal=0;
            window.addEventListener('deviceorientation', this.orientationListener, false);
            window.addEventListener('MozOrientation', this.orientationListener, false);
            window.addEventListener('devicemotion', this.orientationListener, false);
        }
                
        Orientation.prototype.orientationListener = function(evt) {
            // For FF3.6+
            if (!evt.gamma && !evt.beta) {
            // angle=radian*180.0/PI 在firefox中x和y是弧度值,
            evt.gamma = (evt.x * (180 / Math.PI)); //转换成角度值,
            evt.beta = (evt.y * (180 / Math.PI)); //转换成角度值
            evt.alpha = (evt.z * (180 / Math.PI)); //转换成角度值
        }
        /* beta:  -180..180 (rotation around x axis) */
        /* gamma:  -90..90  (rotation around y axis) */
        /* alpha:    0..360 (rotation around z axis) (-180..180) */
          
        var gamma = evt.gamma;
        var beta = evt.beta;
        var alpha = evt.alpha;
                  
        if(evt.accelerationIncludingGravity){
            // window.removeEventListener('deviceorientation', this.orientationListener, false);
            gamma = event.accelerationIncludingGravity.x*10;
            beta = -event.accelerationIncludingGravity.y*10;
            alpha = event.accelerationIncludingGravity.z*10;
        }
                      
        if (this._lastGamma != gamma || this._lastBeta != beta || this._lastAlpha != alpha) {
            //document.querySelector("#test").innerHTML = "x: "+ beta.toFixed(2) + " y: " + gamma.toFixed(2) + " z: " + (alpha != null?alpha.toFixed(2):0);
            var str = "x: "+ beta.toFixed(2) + " y: " + gamma.toFixed(2) + " z: " + (alpha != null?alpha.toFixed(2):0)+"<br><br>";
            result += str;

            var style = document.querySelector("#fight-pointer").style;
                style.left = gamma/90 * 300 + 200 +"px";
                style.top = beta/90 * 300 + 200 +"px";
                       
                this._lastGamma = gamma;
                this._lastBeta = beta;
                this._lastAlpha = alpha;

                var limit = 60; 

                if(gamma>limit){
                    goal+=gamma;
                }
                if(beta>limit){
                    goal+=beta;
                }
                if(alpha>limit){
                    goal+=alpha;
                }

                //total all data
                throw_times++;
                goal=goal/3;
            
            $("#fight-test").html(result);
        }
        
    };

    //set localStorage
    localStorage.setItem("is_message",0);
    localStorage.setItem("is_fight",0);
    localStorage.setItem("fight_times",0);

    function init(){
        $(".fight-show").slideUp(1);
    }

    //onload
    function autoload(){
        //init message for user and bong
        $.ajax({
            type: "get",
            url: "/logo",
            beforeSend: function (XMLHttpRequest) {},
            success: function (data, textStatus) {
                $("#userinfo-logo img").attr("src", "data:image/gif;base64,"+data);
            },
            complete: function (XMLHttpRequest, textStatus) {
                $.get('/check/register', {}, function (data1){
                    //if have register
                    if(data1.result){
                        var str = '';
                        var result;
                        $('#btn-register').remove();//.addClass('hidden');
                        
                        $.get('/bong', {}, function (data2){
                            //get yesterday bong data
                            if(data2){
                                result = data2[0];
                                console.log(result);
                                str='<table class="userinfo-bong-day"><tr><td>您昨天的bong点:</td></tr><tr><td>卡路里:</td><td><div id="userinfo-bong-calorie" class="progress progress-striped active"><div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;" class="progress-bar"><span id="userinfo-bong-calorie-show" class="sr-only">'+result.calories+'</span></div></div></td><tr><tr><td>移动距离:</td><td><div id="userinfo-bong-calorie" class="progress progress-striped active"><div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;" class="progress-bar"><span id="userinfo-bong-calorie-show" class="sr-only">'+result.distance+'</span></div></div></td><tr><tr><td>静坐时间:</td><td><div id="userinfo-bong-calorie" class="progress progress-striped active"><div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;" class="progress-bar"><span id="userinfo-bong-calorie-show" class="sr-only">'+result.stillTime+'</span></div></div></td><tr><tr><td>睡眠时间:</td><td><div id="userinfo-bong-calorie" class="progress progress-striped active"><div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;" class="progress-bar"><span id="userinfo-bong-calorie-show" class="sr-only">'+result.sleepNum+'</span></div></div></td><tr></table>';
                                $('.userinfo-bong').html(str);

                                //get fight times
                                $.get("/get/rank", function (data){
                                    $('#userinfo-fight-times-show').html( data.fightTimes );
                                    localStorage.setItem("fight_times",data.fightTimes);
                                }, "json");
                            }
                        },"json");

                    }else{
                        $("#btn-register").html("点击签到!!");
                    }
                },"json");
            },
            error: function () {}
        });
    }

    $("#btn-register").click(function (e){
        $.get('/register', function (data){
            if(data.result){
                location.href="/";
            }
        },"json");
    });

    $('#message-submit').click(function (e){
        var msg = $('#message-textarea').val();
        var parent = 'null';
        var url='/add/message/msg='+msg+'/parent='+parent;
        
        if(msg==''){
            alert('please input message!');
        }else{
            //console.log(url);
            $.post(url, {}, function (data){
                if(data.result){
                    alert("send successfully!!");
                    $('#message-textarea').val('');
                    $('#btn-message').click();
                }
            },"json");
        }
    });

    $("#btn-message").click(function (e){
        var allmessage ='';
        if(1){//localStorage.getItem("is_message")==0 ){
            //first cilck for message,load message
            $.get('/get/msg', function (data){
                console.log(data);
                if(data){
                    //show message
                    var count = 0;
                    for( var item in data){
                        count++;
                        var msg = data[item].msg,
                            time = data[item].time,
                            uid = data[item].uid;
                        var str = '<tr><td>' + count + ' 楼: '+ time.substring(5,10)  +'</td><td>'+msg+'</td></tr>';
                        var allmessage = str + allmessage ;
                        $("#message-show").slideUp(1);
                        $("#message-show").html(allmessage).slideDown(1000); 
                        //$(str).appendTo("#message-show"); 
                    }

                    localStorage.setItem("is_message",1);
                }
            }, "json");
        }
    });

//next part for fight
    function start_orientation (){
        //start now
        //var start = Date.now();
        var time = 0;
        var second_times=3;
        $("#menubar").slideUp(1000);

        (new Orientation()).init();
        
        setInterval(function (){
            second_times++;
            if(second_times%2){

                var fight_times = localStorage.getItem('fight_times');
                fight_times-=0.5;
                localStorage.setItem("fight_times", fight_times);

                $.post('/update/rank/exp='+ goal/200 + '/fightTimes=' + fight_times, function (data){
                    if(data.result){

                        if(goal<100){   
                            alert("太low了，才：" + goal + "分");
                        }else if( 100<goal<200){  
                            alert("还不错，再甩一把：" + goal + "分");
                        }else{  
                            alert("果真撸神：" + goal + "分");
                        }

                        location.href='/';
                    }else{
                        //console.log(data);
                    }
                }, "json");
            }else{
                //location.href='/';
            }
        },10000);
    }

    function loadingCallback(){
        $('#fight-loadingbar').remove();
        $(".fight-show").slideDown(500);
        start_orientation ();
    }

    function fightLoading(percent){

        $('#fight-progress span').animate({width:percent},500,function(){
            fightLoop();
            $(this).children().html(percent);
            if(percent=='100%'){
                $(this).children().html('加载完成...&nbsp;&nbsp;&nbsp;&nbsp;');
                setTimeout(function(){
                    loadingCallback();
                },1000);
            }
        });
    }

    //loop for loading bar
    var loopNumber = 0;
    var loopPercent;
    var i_dont_know_reason=0;
    function fightLoop(){
        if(loopNumber<=90){
            i_dont_know_reason++;
            setTimeout(function (){
                loopNumber += 20;
                loopPercent = loopNumber+"%";
                if( i_dont_know_reason%2 ){
                    //console.log(loopNumber);
                    fightLoading(loopPercent);
                }
            },400);
        }
    }

    function fightListener(){
        //listen start click
        $("#fight-btn-start").click(function (e){
            $("#fight-start").remove();
            $("#fight-loadingbar").slideDown(200);
            fightLoop();            
        });
    }

    function fightShowInfo(){
        //scroll to show info of fight   
        var info = [
        '撸友会是一个测定你甩手机速度的小游戏～～',
        '只有撸神知道哦～～',
        '每日签到可以增加撸赛机会哦～～',
        '一次比赛只有20秒哦～～',
        '注意你的手机，不要把手机扔出去哦！！！',
        '看看你的手速有多快！！',
        '游戏主要通过测定重力感应的到你的手速～～',
        ];
        setInterval(function(){
            var rand = Math.ceil(Math.random()*7);
            $('.fight-info').html(info[rand]);
        },1500); 
    }

    //go fight
    $("#btn-fight").click(function (e){
        //init for fight
        localStorage.setItem("state",0);
        $("#fight-loadingbar").fadeOut(1);

        $.get('/check/register',function (data){
            if(data.result){
                //check if hava fight times
                $.get("/get/rank",function (data){
                    if(data.fightTimes>0){
                        fightListener();
                        fightShowInfo();
                    }else{
                        alert("今天已经用完了撸赛机会，赶快去bong一下，换取明天的机会！！");
                        location.href="/";
                    }
                },"json");
                
                //have register
                /*if( localStorage.getItem("is_fight")==0 ){
                    var start = Date.now();
                    var count = 0;
                    $('.container').slideDown(100);
            
                    function roop(){
                        //var count = Date.now()-start;
                        count++;
                        var percent=count;
                        if(1){
                            loading(percent);
                        }
                        console.log(count);
                    }
                    var rooploading = setInterval(roop,1);
                }*/
            }else{
                alert("请先签到！！");
                location.href="/";
            }
        }, "json");
    });

//next part for userinfo
    $("#userinfo").click(function (e){
        //update rank

    });

//next part for rank
    $("#btn-rank").click(function (e){

        $.get('/user',function (data){
            if(data){
                console.log(data);
                $('#userinfo-title').html(data.name);
                $('#userinfo-calorie-show').html(data.targetCalorie);
                $('#userinfo-sleeptime-show').html(data.targetSleepTime);
                $('#userinfo-weight-show').html(data.weight);
                $('#userinfo-height-show').html(data.height);

                $.get('/get/rank',function (data){
                    if(data){
                        $("#userinfo-exp-show").html(data.exp);
                        $("#userinfo-rank-show").html(data.rank);
                    }
                }, "json");
            }
        },"json");
    });

    autoload();
    init();

});

