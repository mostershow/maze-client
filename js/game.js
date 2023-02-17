/**
 * Created by Huangpingyi on 2016/8/10.
 */
jewel.game = (function(){
   var dom =jewel.dom,
       $ = dom.$;

    //隐藏活动屏幕（如果有的话），并在屏幕上显示指定ID
   function showScreen(screenId) {
       var activeScreen = $("#game .screen.active")[0],
           screen = $("#" + screenId)[0];
       if (activeScreen) {
           dom.removeClass(activeScreen, "active");
       }
       //运行屏幕模块
       jewel.screens[screenId].run();
       //展示屏幕html
       dom.addClass(screen, "active");
   }

    function setup() {
        // disable native touchmove behavior to
        // prevent overscroll
        dom.bind(document, "touchmove", function(event) {
            event.preventDefault();
        });
        // hide the address bar on Android devices

    }
    return{
        setup :setup,
        showScreen : showScreen
    };
})();