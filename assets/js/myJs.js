/**
 * Created by Administrator on 2015/8/7 0007.
 */
/*Design by Mark Deng 2015-8-7*/
//修改覆盖了原生的 pingtuer.js了
$('.collapse .panel-head').each(function(){
    var e=$(this);
    e.click(function(){
        e.closest(".panel").toggleClass("active");
        e.closest(".panel").find(".panel-head").toggleClass("bg-gray");
        //alert("I Am Mark Deng");
        //e.closest('.collapse').find(".panel").removeClass("active");
    });
});
$('.collapse .panel-head').each(function(){
    var e=$(this);
    e.click(function(){
        e.closest(".panel").find("span").toggleClass("icon-angle-down");
    });
});

$('.button-group .button').each(function(){
    var e=$(this);
    e.click(function(){
        e.closest('.button-group').find(".button").removeClass("active");
        e.closest(".button").addClass("active");
    });
});