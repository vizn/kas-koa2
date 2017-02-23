'use strict';

var path = require('path');
var _ = require('lodash');
var fs = require('fs');

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var all = {
  env: process.env.NODE_ENV,
  root: path.normalize(__dirname + '/../../..'),
  // port: process.env.PORT || 3000,
  //mongodb配置
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  //redis 配置
  redis: {
    host: '123.57.64.130',
    port: 26379,
    password: 'vizn2016'
  },
  //是否初始化数据
  seedDB: false,
  session:{
    secrets: 'keepaccount-secret'
  },
  //用户角色种类
  userRoles: ['user', 'admin'],
  //默认首页图片.
  defaultIndexImage:"",
  //第三方登录配置
  github:{
    clientID:"github",
    clientSecret:"clientSecret",
    callback:"/auth/github/callback"
  },
  weibo:{
    clientID:"clientID",
    clientSecret:"clientSecret",
    callbackURL:"/auth/weibo/callback"
  },
  qq:{
    clientID:"clientID",
    clientSecret:"clientSecret",
    callbackURL:"/auth/qq/callback"
  },
  //移动APP列表
  apps:[
    {
      name:'React Native',
      gitUrl:'http://github.com/jackhutu/jackblog-react-native-redux',
      downloadUrl:{
        android:'http://a.app.qq.com/o/simple.jsp?pkgname=top.jackhu.reactnative',
        ios:''
      },
      qrcode:'http://upload.jackhu.top/qrcode/jackblog-react-native-qrcode.png'
    }
  ],
  //开启第三方登录
  snsLogins:['github','qq']
};

var config = _.merge(all,require('./' + process.env.NODE_ENV + '.js') || {});
//加载私有配置
// if (fs.existsSync(path.join(__dirname, 'private/index.js'))) {
//   config = _.merge(config, require(path.join(__dirname, 'private/index.js')) || {});
// }
module.exports = config;
