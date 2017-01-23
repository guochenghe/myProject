/*
* @Author: Administrator
* @Date:   2016-06-28 13:41:15
* @Last Modified by:   Administrator
* @Last Modified time: 2016-06-28 13:54:10
*/
function controller (){
	this.request = function(apiUrl, data, params) {
        var classSelf = this;
        var type = (params === null || params.type === null || params.type === undefined) ? "GET" : params.type;
        if (this.environment !== "production") type = "GET"; //只要是jsonp请求，type肯定为GET
        var process = (params === null || params.process === null || params.process === undefined) ? null : params.process;
        var showLoadingTips = (params === null || params.showLoadingTips === null || params.showLoadingTips === undefined) ? true : params.showLoadingTips;
        var loadingTips = (params === null || params.loadingTips === null || params.loadingTips === undefined) ? "正在加载数据，请稍等..." : params.loadingTips;
        var apiDataType = (params === null || params.apiDataType === null || params.apiDataType === undefined) ? this.apiDataType : params.apiDataType;
        var onExceptionInterface = (params === null || params.onExceptionInterface === null || params.onExceptionInterface === undefined) ? null : params.onExceptionInterface;
        try {
            $.ajax({
                url: apiUrl,
                type: type,
                data: data,
                dataType: apiDataType,
                jsonpCallback: "callback",
                error: function(e) {
                    throw new Error ('Interface barrier');
                },
                success: function(data) {
                    $("#" + classSelf.tipsDialogId).modal("hide");
                    if (data.code.toString() === "301") classSelf.clearCookieRedirect();
                    else if (data.code.toString() === "200") {
                        if (process) process(data); //一切没有问题，就处理数据
                    } else {
                        //911的情况，后台数据没有返回message，需要将message重新赋值
                        if (data.code.toString() === "911") {
                            data.message = "登录已超时！";
                        }
                        if (onExceptionInterface) onExceptionInterface(data.code, data.message);
                    }
                }
            });
        } catch (e) {
            alert("错误名称：" + e.name + "\n错误描述：" + e.message);
        }
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        整个try-catch块结束
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    };
}

$(function() {
	new controller;
});
 