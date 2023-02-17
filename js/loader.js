/**
 * Created by Huangpingyi on 2016/8/3.
 */
var jewel = {
    screens : {}
};

//在加载主文件前等待
window.addEventListener("load" , function(){

    //开始动态加载
    Modernizr.load([
        {
        //这些文件一直被加载
        load : [
        "js/sizzle.js",
        "js/dom.js",
        "js/game.js",
        "js/screen.splash.js",
        "js/screen.main-menu.js"
    ],
        //所有文件已完成加载并执行后调用
    complete : function() {
        //
        jewel.game.showScreen("splash-screen");
       }
    }
    ]);
},false);