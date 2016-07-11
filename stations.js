/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：成都地铁
 2. 页面名称：stations (车站地图页)
 3. 作者：赵华刚(zhaohuagang@guanaihui.com)
 4. 备注：对api的依赖：jQuery
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function StationsController() {
    this.domain = "http://testapi.cddtwx.cn/" ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面滚动到什么坐标位置让市中心恰好显示在页面中间
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.centerLongitude = 430 ;
    this.centerLatitude = 100 ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    站点圆圈的半径
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.cycleRadius = 13 ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    导航向导的路线图是否需要动画效果，默认不要
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.guideAnimation = false ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    ajax接口地址
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.allStationsApiUrl = this.domain + "/api/Metro/GetAllStation" ;
    this.navigatorApiUrl = this.domain + "/api/Metro/MetroPathQuery" ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    车站信息和查看详情两个链接的地址的前缀
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.stationDetailUrlPrefix = this.domain + "/metro/stationdetail" ;
    this.queryDetailUrlPrefix = this.domain + "/metro/metroquery" ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    从Controller基类继承
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    Controller.call(this);
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    导航开始后圆圈闪动的定时触发的定时器
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.timer = {} ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绑定事件
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.mapLoaded() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面加载的时候就将滚动条滚动到市中心正好在页面中心
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    //this.initPosition() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绘制站点
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/    
    this.drawStations() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绘制位置图标
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.drawLocationIcon() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绑定事件
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.bind() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    初始化跳转链
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.initNativeRedirectUrl();
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    定义全局变量路线data
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    this.routeData = {};

    this.botWithe();
    //this.hasSwapStation();
}
/*原生点击切换城市*/
StationsController.prototype.hasSwapStation = function(){
     var classSelf = this;
     this.domain = "http://testapi.cddtwx.cn/" ;
     this.queryDetailUrlPrefix = this.domain + "/metro/metroquery" ;
     
     
    if($('.location.terminal').css('display')=='block' && $('.location.start').css('display')=='block'){
        
        if($('.location').eq(0).hasClass('start')){
            $('.location').eq(0).removeClass('start').addClass('terminal').siblings('.location').removeClass('terminal').addClass('start');
        }else{
            $('.location').eq(0).removeClass('terminal').addClass('start').siblings('.location').removeClass('start').addClass('terminal');
        }

        var startId=$("#startId").val();
        var terminalId=$("#terminalId").val();
        $("#startId").val(terminalId);
        $("#terminalId").val(startId);
        var startIdOne = encodeURIComponent($("#startId").val());
        var terminalIdOne = encodeURIComponent($("#terminalId").val());
        //alert(startIdOne+ ','+terminalIdOne);
        var TZurl ='{'+'url:' +'"'+this.queryDetailUrlPrefix + "?start=" + startIdOne + "&end=" + terminalIdOne+'"'+'}';
        window.jsObject.handleGetDetail(TZurl);
        classSelf.routeData.url = classSelf.queryDetailUrlPrefix + "?start=" + startId + "&end=" + terminalId ;
    }else if($('.location.terminal').css('display')!='block' && $('.location.start').css('display')=='block'){
        
        if($('.location').eq(0).hasClass('start')){
            $('.location').eq(0).removeClass('start').addClass('terminal').siblings('.location').removeClass('terminal').addClass('start');
        }else{
            $('.location').eq(0).removeClass('terminal').addClass('start').siblings('.location').removeClass('start').addClass('terminal');
        }
    }else if($('.location.terminal').css('display')=='block' && $('.location.start').css('display')!='block'){
        
        if($('.location').eq(0).hasClass('start')){
            $('.location').eq(0).removeClass('start').addClass('terminal').siblings('.location').removeClass('terminal').addClass('start');
        }else{
            $('.location').eq(0).removeClass('terminal').addClass('start').siblings('.location').removeClass('start').addClass('terminal');
        }
    }
};

/*原生点击选择城市*/
StationsController.prototype.hasChooseStation=function(stationName,type){
    var classSelf=this;
    var $cycle;
    
    for(var i=0;i<$('.cycle').length;i++){
        $('.cycle').eq(i).css('opacity','0.01');
        if($('.cycle').eq(i).attr('data-name')==stationName){

            $cycle=$('.cycle').eq(i);
        }
    }
    if(type==0){
        $cycle.trigger('click');
        $("#setAsStart").trigger('click');
        $('.context-menu').hide();
        classSelf.setKey(0);
        classSelf.navigate();
    }else if(type==1){
        $cycle.trigger('click');
        $("#setAsTerminal").trigger('click');
        $('.context-menu').hide();
        classSelf.navigate();
    }
};

/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
底部留白
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.botWithe = function(){
    $('.botImg').css('width',$('.map img').css('width'));
}
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
初始化native 跳转Url
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.initNativeRedirectUrl = function(type,stationName) {
    var classSelf = this;
    var $cycle;
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
        function setupWebViewJavascriptBridge(callback) {
            if (window.WebViewJavascriptBridge) {
                return callback(WebViewJavascriptBridge);
            }
            if (window.WVJBCallbacks) {
                return window.WVJBCallbacks.push(callback);
            }
            window.WVJBCallbacks = [callback];
            var WVJBIframe = document.createElement('iframe');
            WVJBIframe.style.display = 'none';
            WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
            document.documentElement.appendChild(WVJBIframe);
            setTimeout(function() {
                document.documentElement.removeChild(WVJBIframe)
            }, 0)
        }
        setupWebViewJavascriptBridge(function(bridge) {
            /*IOS调用web本地方法*/

            /*IOS选择地铁站点*/
            bridge.registerHandler('hasChooseStation',function(data, responseCallback) { //IOS调用本地方法并传值过来，处理页面
                for(var i=0;i<$('.cycle').length;i++){
                    $('.cycle').eq(i).css('opacity','0.01');
                    if($('.cycle').eq(i).attr('data-name')==data.name){
                        $cycle=$('.cycle').eq(i);
                    }
                }
                if(data.type==0){

                    $cycle.trigger('click');
                    $("#setAsStart").trigger('click');
                    $('.context-menu').hide();
                    classSelf.setKey(0);
                    classSelf.navigate();
                }else if(data.type == 1){

                    $cycle.trigger('click');
                    $("#setAsTerminal").trigger('click');
                    $('.context-menu').hide();
                    classSelf.setKey(1);
                    classSelf.navigate();
                    
                }
  
            })

            /*IOS切换终点起点*/
            bridge.registerHandler('hasSwapStation', function(data, responseCallback) {

                if($('.location.terminal').css('display')=='block' && $('.location.start').css('display')=='block'){
                    if($('.location').eq(0).hasClass('start')){
                        $('.location').eq(0).removeClass('start').addClass('terminal').siblings('.location').removeClass('terminal').addClass('start');
                    }else{
                        $('.location').eq(0).removeClass('terminal').addClass('start').siblings('.location').removeClass('start').addClass('terminal');
                    }

                    var startId=$("#startId").val();
                    var terminalId=$("#terminalId").val();
                    $("#startId").val(terminalId);
                    $("#terminalId").val(startId);
                    classSelf.navigate();
                }else if($('.location.terminal').css('display')!='block' && $('.location.start').css('display')=='block'){
                    
                    if($('.location').eq(0).hasClass('start')){
                        $('.location').eq(0).removeClass('start').addClass('terminal').siblings('.location').removeClass('terminal').addClass('start');
                    }else{
                        $('.location').eq(0).removeClass('terminal').addClass('start').siblings('.location').removeClass('start').addClass('terminal');
                    }
                }else if($('.location.terminal').css('display')=='block' && $('.location.start').css('display')!='block'){
                    
                    if($('.location').eq(0).hasClass('start')){
                        $('.location').eq(0).removeClass('start').addClass('terminal').siblings('.location').removeClass('terminal').addClass('start');
                    }else{
                        $('.location').eq(0).removeClass('terminal').addClass('start').siblings('.location').removeClass('start').addClass('terminal');
                    }
                }

            });

            /*本地调用IOS方法*/

            // 本地执行初始化页面的事件
            var flag=0;
            $(".mask").click(function(){
                if($('.location.terminal').css('display')=='block' && $('.location.start').css('display')=='block'){
                    classSelf.reset();

                    // 客户端执行初始化页面
                    
                    bridge.callHandler('handleReset',{}, function(response) {
                        
                    });
                        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        阻止事件冒泡
                        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                        event.stopPropagation() ;
                    if(flag!=0){
                        flag--;
                    }else{
                        flag++;
                    }
                }
            }) ;

            /*web设置终点起点*/
            $("#setAsStart").click(function(){
                bridge.callHandler('handleSetStation',{
                    stationName:$('#startId').val(),
                    type:'0'
                }, function(response) {
                       
                });
            })

            $("#setAsTerminal").click(function(){

                bridge.callHandler('handleSetStation',{
                    stationName:$('#terminalId').val(),
                    type:'1'
                }, function(response) {
                       
                });
            })
 

        })
    } else if (userAgent.match(/Android/i)) {

        /*本地调用Android方法*/

        /*web设置终点起点*/
            $("#setAsStart").click(function(){
                var stationName = '{'+'stationName:'+'"'+$('#startId').val()+'"'+ ',' +'type:'+ '0'+'}';
                window.jsObject.handleSetStation(stationName);
            })

            $("#setAsTerminal").click(function(){

                var stationName = '{'+'stationName:'+'"'+$('#terminalId').val()+'"'+ ',' +'type:'+ '1'+'}';
                window.jsObject.handleSetStation(stationName);
            })
            
         // 本地执行初始化页面的事件
            var flag=0;
            $(".mask").click(function(){
                if($('.location.terminal').css('display')=='block' && $('.location.start').css('display')=='block'){
                    classSelf.reset();

                    // 客户端执行初始化页面
                    
                    window.jsObject.handleReset();
                        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        阻止事件冒泡
                        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                        event.stopPropagation() ;
                    if(flag!=0){
                        flag--;
                    }else{
                        flag++;
                    }
                }
            }) ;

    }
}

/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
图片加载完毕关闭提示
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.mapLoaded = function() {    
    $(".map img").one('load', function() {
        $(".loading").fadeOut(200) ;
    }).each(function() {
        if(this.complete) $(this).load();
    });
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
判断是否可以触发计算
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.isReady = function() {
    if($("#startId").val() == "" || $("#terminalId").val() == "") return false ;
    return true ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
页面加载的时候就将滚动条滚动到市中心正好在页面中心
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.initPosition = function() {
    var classSelf = this ;
    $("html,body").animate({
        scrollLeft : classSelf.centerLonigtude + "px" ,
        scrollTop : classSelf.centerLatitude + "px"       
    }, 500) ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
绘制位置图标
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.drawLocationIcon = function() {
    $(document.body).append($(document.createElement("DIV")).addClass("location start")) ;
    $(document.body).append($(document.createElement("DIV")).addClass("location terminal")) ;
};
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
绘制站
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.drawStations = function() {
    var classSelf = this ;    
    classSelf.request(classSelf.allStationsApiUrl, {}, {

        process : function(data) {            
            $(data.returnObject).each(function(){
                var $cycle = $(document.createElement("DIV")).attr("id", this.cName).attr("data-name", this.cName).addClass("cycle").css({ "width" : classSelf.cycleRadius * 2 + "px" , "height" : classSelf.cycleRadius * 2 + "px" ,  "left" : (this.x - classSelf.cycleRadius) + "px" , "top" : (this.y - classSelf.cycleRadius) + "px" }).fadeTo(200, .01) ;
                $(document.body).append($cycle) ;
                $cycle.click(function(event){
                    var offset={
                        left:event.pageX,
                        top:event.pageY,
                      };
                    $(".context-menu").show().css({ "left" : offset.left + "px" , "top" : offset.top + "px" }).attr("data-target", $(this).attr("id")) ;
                    
                    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                   功能菜单中当前站点名称改掉
                    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                    $("#viewStationDetail").attr("href", classSelf.stationDetailUrlPrefix + "?name=" + encodeURIComponent($(this).attr("id"))) ;

                    

                    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
                        function setupWebViewJavascriptBridge(callback) {
                            if (window.WebViewJavascriptBridge) {
                                return callback(WebViewJavascriptBridge);
                            }
                            if (window.WVJBCallbacks) {
                                return window.WVJBCallbacks.push(callback);
                            }
                            window.WVJBCallbacks = [callback];
                            var WVJBIframe = document.createElement('iframe');
                            WVJBIframe.style.display = 'none';
                            WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
                            document.documentElement.appendChild(WVJBIframe);
                            setTimeout(function() {
                                document.documentElement.removeChild(WVJBIframe)
                            }, 0)
                        }
                        setupWebViewJavascriptBridge(function(bridge) {

                            // 显示车站信息跳转原生链接
                            $('#viewStationDetail').unbind('click');
                            $('#viewStationDetail').click(function(event) {
                                bridge.callHandler('handleGetStation',{url:$("#viewStationDetail").attr("href")}, function(response) {
                                        
                                });
                                event.preventDefault();
                            });
                            
                        })
                    } else if(userAgent.match(/Android/i)) {
                        $('#viewStationDetail').unbind('click');
                        $('#viewStationDetail').click(function(event) {
                            var Turl = '{' + 'url:' + '"'+$("#viewStationDetail").attr("href") +'"'+ '}';
                            window.jsObject.handleGetStation(Turl);
                            
                            event.preventDefault();
                        });

                    }


                    $(".context-menu .selected-station").text($(this).attr("data-name")) ;
                    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                    阻止事件冒泡
                    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                    event.stopPropagation() ;
                }) ;
            }) ;
        } 
    }) ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
绑定事件
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.bind = function() {    
    var classSelf = this ;
    $(document.body).click(function(){
        $(".context-menu").hide() ;
    }) ;
    $("#setAsStart").click(function(){
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        首先要做判断，是否选择了终点站，如果选择了并且和想要选择的起点站一样，就清楚掉终点站设置
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/         
        if($("#terminalId").val() === $(".context-menu").attr("data-target")) {
            classSelf.clearKey("terminal");
        }
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        设置关键站点信息
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        classSelf.setKey("start");        
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        开始导航
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        classSelf.navigate();

        /*选择本地起点的时候给IOS传值*/
        /*bridge.callHandler('handleSetStation',{
            stationName:$('#startId').val(),
            type:'0'
        }, function(response) {
            
        })*/

    }) ;
    $("#setAsTerminal").click(function() {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        首先要做判断，是否选择了起点站，如果选择了并且和想要选择的终点站一样，就清楚掉起点站设置
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/         
        if($("#startlId").val() === $(".context-menu").attr("data-target")) {
            classSelf.clearKey("start") ;
        }
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        设置关键站点信息
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        classSelf.setKey("terminal");
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        开始导航
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        classSelf .navigate() ;

    
        
    }) ;
    
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
计算并开始导航
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.navigate = function() {
    if( ! this.isReady()) return ;
    var classSelf = this ;
    this.request(this.navigatorApiUrl, { "startStation" : $("#startId").val() , "endStation" : $("#terminalId").val() }, {
        process : function(data) {
            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            遮罩层打开
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            $(".mask").show();
            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            让相关站点亮起来
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            $(data.returnObject.stationCollection).each(function(index, element){
                var callback = null ;
                if(classSelf.guideAnimation) {
                    callback = function(){
                        classSelf.timer[index] = window.setInterval(function(){
                            $("#" + element.cName).fadeTo(500, 0).fadeTo(500, 1) ;
                        }, 2000) ;                        
                    } ;
                }
                $("#" + element.cName).delay(100 * index).fadeTo(500, 1, callback) ;                     
            });
            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            概述写进去
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            classSelf.routeData.routeTime = data.returnObject.routeTime;
            classSelf.routeData.stationCount = data.returnObject.stationCount;
            classSelf.routeData.ticketPrice = data.returnObject.ticketPrice;
            classSelf.routeData.startDot = $("#startId").val();
            classSelf.routeData.endDot = $("#terminalId").val();
            

            var startId = encodeURIComponent($("#startId").val());
            var terminalId = encodeURIComponent($("#terminalId").val());

            classSelf.routeData.url = classSelf.queryDetailUrlPrefix + "?start=" + startId + "&end=" + terminalId ;


            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
                function setupWebViewJavascriptBridge(callback) {
                    if (window.WebViewJavascriptBridge){
                        return callback(WebViewJavascriptBridge);
                    }
                    if (window.WVJBCallbacks) {
                        return window.WVJBCallbacks.push(callback);
                    }
                    window.WVJBCallbacks = [callback];
                    var WVJBIframe = document.createElement('iframe');
                    WVJBIframe.style.display = 'none';
                    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
                    document.documentElement.appendChild(WVJBIframe);
                    setTimeout(function() {
                        document.documentElement.removeChild(WVJBIframe)
                    }, 0) 
                }
                setupWebViewJavascriptBridge(function(bridge) {

                    bridge.callHandler('handleSetRoute',classSelf.routeData);

                })
            } else if (userAgent.match(/Android/i)) {
                /*路线完成显示路线*/

                var newRouteData = '{'+ 'startDot:'+'"'+classSelf.routeData.startDot+'"'+','+'endDot:'+'"'+classSelf.routeData.endDot+'"'+','+ 'routeTime:'+'"'+classSelf.routeData.routeTime+'分钟'+'"'+','+'stationCount:'+'"'+'途经'+classSelf.routeData.stationCount+'站'+'"'+','+'ticketPrice:'+'"'+'需'+classSelf.routeData.ticketPrice+'元'+'"'+','+'url:'+'"'+classSelf.routeData.url+'"'+'}';
                window.jsObject.handleSetRoute(newRouteData);
            }

        } 
    }) ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
设置关键点
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.setKey = function(keySign) {
    var classSelf = this;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    把起点站写到隐藏域里面去
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    if(keySign =='start'){
        $('.startEnd .metro em').eq(0).children('i').html($(".context-menu").attr("data-target"));
    }else if(keySign == 'terminal'){
        $('.startEnd .metro em').eq(1).children('i').html($(".context-menu").attr("data-target"));
    }
    if(keySign==0 || keySign=="start"){
        keySign="start";
        $("#" + keySign + "Id").val($(".context-menu").attr("data-target")) ;   
    }else if(keySign==1 || keySign=="terminal"){
        keySign="terminal";
        $("#" + keySign + "Id").val($(".context-menu").attr("data-target")) ;
    }
    
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    关键点站图标移动到相应位置并显示
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    var pos={
      left:$("#" + $(".context-menu").attr("data-target"))[0].offsetLeft,
      top:$("#" + $(".context-menu").attr("data-target"))[0].offsetTop
    };
    if(keySign==0 || keySign=="start"){
       keySign="start";
       $(".location." + keySign).css({ "left" :  (pos.left + this.cycleRadius - 20) + "px" , "top" : (pos.top + this.cycleRadius - 48) + "px" }).show() ;
       $(".memo ." + keySign + "-station").html($("#" + $(".context-menu").attr("data-target")).attr("data-name")) ;
    }else if(keySign==1 || keySign=="terminal"){
        keySign="terminal";
        $(".location." + keySign).css({ "left" :  (pos.left + this.cycleRadius - 20) + "px" , "top" : (pos.top + this.cycleRadius - 48) + "px" }).show() ;
        $(".memo ." + keySign + "-station").html($("#" + $(".context-menu").attr("data-target")).attr("data-name")) ;
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    把关键点站名写到memo里面去
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
设置关键点
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.clearKey = function(keySign) {
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    把隐藏域值清空
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $("#" + keySign + "Id").val();
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    图标隐藏
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/    
    $(".location." + keySign).hide() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    memo里面信息清空
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $(".memo ." + keySign + "-station").empty() ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
重置页面
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
StationsController.prototype.reset = function() {
    $('.startEnd .metro em').eq(0).children('i').html('起点');
    $('.startEnd .metro em').eq(1).children('i').html('终点');
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    遮罩层关闭
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/    
    $(".mask").hide() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    定位图标消失
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/   
    $(".location").hide() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    关掉定时器
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/  
    for(key in this.timer) {
        window.clearInterval(this.timer[key]);
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    圆圈图标消失
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/  
    $(".cycle").fadeTo(200, 0) ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   计算结果关闭
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/  
    $(".memo").hide() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   页面回到初始位置
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    //this.initPosition() ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   起点和终点值清空
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $("#startId").val("") ;
    $("#terminalId").val("") ;
} ;


$(function() {
    new StationsController ;
});
