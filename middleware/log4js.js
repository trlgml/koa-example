/**
 * 日志模块.初始化
 */
var fs = require('fs');
var log4js = require('log4js');

var log_config = require('../config/log_config');

/**
 * 确定目录是否存在，如果不存在则创建目录
 */
var confirmPath = function(pathStr) {

  if(!fs.existsSync(pathStr)){
      fs.mkdirSync(pathStr);
      console.log('createPath: ' + pathStr);
    }
}

/**
 * 初始化log相关目录
 */
var initLogPath = function(){
  //创建log的根目录'logs'
  if(log_config.baseLogPath){
    confirmPath(log_config.baseLogPath)
    //根据不同的logType创建不同的文件目录
    for(var i = 0, len = log_config.appenders.length; i < len; i++){
      if(log_config.appenders[i].path){
        confirmPath(log_config.baseLogPath + log_config.appenders[i].path);
      }
    }
  }
}

initLogPath();


//加载配置文件
log4js.configure(log_config);

var logUtil = {};

var errorLogger = log4js.getLogger('errorLogger');
var resLogger = log4js.getLogger('resLogger');

//封装错误日志
logUtil.logError = function (req, error) {
    if (error) {
        errorLogger.error(formatError(req, error));
    }
};

//封装响应日志
logUtil.logResponse = function (req, res) {
    if (res) {
        resLogger.info(formatRes(req, res));
    }
};

//格式化响应日志
var formatRes = function (req, res) {
    var logText = new String();

    //响应日志开始
    logText += "\n" + "*************** response log start ***************" + "\n";

    //添加请求日志
    logText += formatReqLog(req);

    //响应状态码
    logText += "response status: " + res.status + "\n";

    //响应内容
    logText += "response body: " + "\n" + JSON.stringify(res.body) + "\n";

    //响应日志结束
    logText += "*************** response log end ***************" + "\n";

    return logText;

}

//格式化错误日志
var formatError = function (req, err) {

    var logText = new String();

    //错误信息开始
    logText += "\n" + "*************** error log start ***************" + "\n";

    //添加请求日志
    logText += formatReqLog(req);

    //错误名称
    logText += "err name: " + err.name + "\n";
    //错误信息
    logText += "err message: " + err.message + "\n";
    //错误详情
    logText += "err stack: " + err.stack + "\n";

    //错误信息结束
    logText += "*************** error log end ***************" + "\n";

    return logText;
};

//格式化请求日志
var formatReqLog = function (req) {

    var logText = new String();

    var method = req.method;
    //访问方法
    logText += "request method: " + method + "\n";

    //请求原始地址
    logText += "request originalUrl:  " + req.originalUrl + "\n";

    //客户端ip
    logText += "request client ip:  " + req.ip + "\n";

    //请求参数
    if (method === 'GET') {
        logText += "request query:  " + JSON.stringify(req.query) + "\n";
        // startTime = req.query.requestStartTime;
    } else {
        logText += "request body: " + "\n" + JSON.stringify(req.body) + "\n";
        // startTime = req.body.requestStartTime;
    }

    return logText;
}

module.exports = logUtil;