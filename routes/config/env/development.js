'use strict';

// 开发环境配置
// ==================================
module.exports = {
  //开发环境mongodb配置
  mongo: {
    uri: 'mongodb://123.57.64.130/KeepAccount',
    options: {
      user:'ka',          //开发环境用户名
      pass:'vizn2016'           //开发环境密码
    }
  },
  //开发环境redis配置
  redis: {
    db: 0
  },
  seedDB: true,
  session:{
    cookie:  {maxAge: 60000*5}
  },
  //cors设置
  corsOptions: {
    origin:'http://192.168.31.182:8080', //允许发来请求的域名，对应响应的`Access-Control-Allow-Origin`
    allowMethods:'GET,HEAD,PUT,POST,DELETE',//允许的方法，默认'GET,HEAD,PUT,POST,DELETE'，对应`Access-Control-Allow-Methods`
    exposeHeaders:'',//允许客户端从响应头里读取的字段，对应`Access-Control-Expose-Headers`，
    allowHeaders:'',//这个字段只会在预请求的时候才会返回给客户端，标示了哪些请求头是可以带过来的，对应`Access-Control-Allow-Headers`，
    maxAge:'',//也是在预请求的时候才会返回，标明了这个预请求的响应所返回信息的最长有效期，对应`Access-Control-Max-Age`
    credentials: true//标示该响应是合法的，对应`Access-Control-Allow-Credentials`
  }
};
