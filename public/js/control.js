$(document).ready(function() {

    localStorage.setItem("fight",0);

    /* get发包 */
    /* profile */
    $.ajax({
        type: "get",
        url: "/profile",
        beforeSend: function (XMLHttpRequest) {
        },
        success: function (data, textStatus) {
            console.log(data);
            $("#userinfo-title").html(data.monsterName);
            $("#userinfo-name").html(data.name);
            $("#userinfo-monsterAtk").attr("width", data.monsterAtk);
            $("#userinfo-monsterAtk-show").html( parseInt(data.monsterAtk,10) + " 力量");
            $("#user-info-monsterHp").attr("width", data.monsterHp);
            $("#user-info-monsterHp-show").html(data.monsterHp + " 血");
        },
        complete: function (XMLHttpRequest, textStatus) {

        },
        error: function () {
        }
    });

    /* search */
    $("#btn-search").click(function () {
        $.ajax({
            type: "get",
            url: "/search/getAllUsers",
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (data, textStatus) {
                console.log(data);
                var html = '';
                $.each(data, function (n) {
                    console.log(data[n]);
                    html += '<li><a href="#" class="search-item item-link" data='+data[n].userinfo.uid+'><div class="item-content"><div class="item-inner"><div class="search-title">' + data[n].monster.name + '</div><div class="search-rank">' + data[n].monster.hp + '</div><div class="fight">决斗</div></div></div></a></li>';
                });
                $("#search-panel").html(html);

                if( localStorage.getItem("fight")==0 ) {
                    $(".search-panel").slideDown(1000);
                    $(".fight-panel").slideUp(1000);
                }

                cilckevent();
            },
            complete: function (XMLHttpRequest, textStatus) {

            },
            error: function () {
            }
        });
    });

    function cilckevent() {
        $(".search-item").click(function () {

            localStorage.setItem("fight",1);

            $(".search-panel").slideUp(1000);
            $(".fight-panel").slideDown(1000);

            //$("#btn-result").fadeIn(100).slideDown(1000);

            $.ajax({
                type: "get",
                url: "/attack/muid="+$(this).attr("data")+"/yuid="+$(".hidden").html(),
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data, textStatus) {
                    console.log(data);

                    $("#blood .progress-bar").attr('width',data["me"].hp);
                    $("#blood .progress-bar .sr-only").html(data["me"].hp+"血量");

                    /* localstorage save */
                    localStorage.setItem("all_blood",data["me"].hp);
                    localStorage.setItem("me-hp",data["me"].hp);
                    localStorage.setItem("me-attack",data["me"].atk);
                    localStorage.setItem("me-exp",data["me"].exp);

                    localStorage.setItem("you-hp",data["you"].hp);
                    localStorage.setItem("you-attack",data["you"].atk);
                    localStorage.setItem("you-exp",data["you"].exp);

                    localStorage.setItem("yuid",data["you"].uid);
                    localStorage.setItem("muid",data["me"].uid);

                    var times = localStorage.setItem("times",3);
                },
                complete: function (XMLHttpRequest, textStatus) {

                },
                error: function () {
                }
            });
        });
    }

        $(".fight-panel li").click(function () {
            if (!$(this).hasClass("clicked")) {
                console.log($(this));
                $(".fight-sign").slideDown(500);
                $(".fight-sign").slideUp(1000);
                $(this).slideUp(1000);//addClass("clicked");

                var times = localStorage.getItem("times");
                times-=1;
                localStorage.setItem("times",times);

                var me_atk=localStorage.getItem("me-attack")*( 1+0.5*localStorage.getItem("me-exp") )/100;
                var you_atk=localStorage.getItem("you-attack")*( 1+0.5*localStorage.getItem("you-exp") )/100;

                var me_blood = localStorage.getItem("me-hp")-you_atk;
                var you_blood = localStorage.getItem("you-hp")-me_atk;

                console.log(me_atk);
                console.log(times);

                /* 1 for my success */
                if( me_blood<0 ){
                    result(0);
                }else if( you_blood<0 ){
                    result(1);
                }else if(times==0){
                    if( me_blood>you_blood){
                        result(1);
                    }else{
                        result(0);
                    }
                }

                localStorage.setItem("you-hp",you_blood);
                localStorage.setItem("me-hp",me_blood);

                /* 扣血 */
                //alert(localStorage.getItem("all_blood") );
                var pecent = me_blood/(localStorage.getItem("all_blood"));
                pecent = parseInt( pecent*100,10 );
                console.log(pecent);
                $("#blood-bar").attr({'width':pecent+'%','aria-valuenow':pecent});
                $("#blood .progress-bar .sr-only").html( parseInt(me_blood,10)+"血量");
            }
        });

        $("#btn-result").click(function(){
            var you_blood= localStorage.getItem("you-hp");
            var me_blood = localStorage.getItem("me-hp");
            if( you_blood>me_blood ){
                result(0);
            }else{
                result(1);
            }
        });

        function result( data ){
            localStorage.setItem("fight",0);
            /* 1 is you win */
            var final = 0;
            if(data){
                final = 0;
                alert("耶，你赢啦~~");
            }else{
                final = 1 ;
                alert("哎呀，输了，兽兽累了。");
            }
            var args={
                muid:localStorage.getItem("muid"),
                yuid:localStorage.getItem("yuid"),
                final: final
            }

            console.log(args);
            $.post('/addExp/muid='+localStorage.getItem("muid")+'/yuid='+localStorage.getItem("yuid"), args, function (data){
                console.log(data);
                if (data.result) {

                } else {

                }
            },"json");

            location.reload();
        }

    /* 签到 */
    $("#btn-register").click(function(){
        var args={}
        $.get('/register', args, function (data){
            console.log(data);
            if (data.err == "1" ) {
                alert("今天到咯~~");
                location.reload();
            } else {
                alert("你今天已经来看你的宠物咯~~");
            }
        },"json");
    });
	$(".fight-sign").slideUp(1);
});