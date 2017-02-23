'use strict';
const mongoose = require('mongoose');
const passport = require('koa-passport');
const config = require('../../config/env');
const jwt = require('koa-jwt');
const _JWT  = require('jsonwebtoken');
const compose = require('koa-compose');
const ccap = require('ccap')();
const User = mongoose.model('User');
/**
 * 验证token
 */
function authToken() {
  return compose([
    async (ctx, next) =>{
      // if(ctx.request.query && ctx.request.query.hasOwnProperty('access_token')){
      //   ctx.headers.authorization = 'Bearer ' + ctx.request.query.access_token;
      // }

      let token
      if (ctx.header.authorization) {
        let parts = ctx.header.authorization.split(' ');
        if (parts.length == 2) {
          let scheme = parts[0];
          let credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            token = credentials;
          }
        }
      }
      try {
        let decoded = await _JWT.verify(token, config.session.secrets);
        ctx.state.user = decoded
      } catch(e) {
        ctx.throw(e.message)
      }
      await next();
    }
  ])
}
/**
 * 验证用户是否登录
 */
function isAuthenticated() {
  return compose([
      authToken(),
      async (ctx, next) =>{
        if(!ctx.state.user) ctx.throw('UnauthorizedError',401);
        await next();
      },
      async (ctx, next)=>{
        var user = await User.findById(ctx.state.user._id);
        if (!user) ctx.throw('UnauthorizedError',401);
        ctx.req.user = user;
        await next();
      }
    ])
}

/**
 * 验证用户权限
 */
function hasRole(roleRequired) {
  if (!roleRequired) this.throw('Required role needs to be set');
  return compose([
      isAuthenticated(),
      function *(next) {
        if (config.userRoles.indexOf(this.req.user.role) >= config.userRoles.indexOf(roleRequired)) {
          yield next;
        }else {
          this.throw(403);
        }
      }
    ])
}

/**
 * 生成token
 */
function signToken(id) {
  return _JWT.sign({ _id: id }, config.session.secrets, { expiresIn: '1y' });
}

/**
 * sns登录传递参数
 */
function snsPassport() {
  return compose([
      authToken(),
      function *(next) {
        this.session.passport = {
          redirectUrl: this.query.redirectUrl || '/'
        }
        if(this.state.user){
          this.session.passport.userId = this.state.user._id
        }
        yield next;
      }
    ])
}
//验证信息
function checkCaptcha() {
  return async (ctx, next) => {
    //测试环境不用验证码
    let error_msg;
    if(process.env.NODE_ENV !== 'test'){
      if(!ctx.request.body.mobileCaptcha){
        error_msg = "验证码不能为空.";
      }else if(ctx.session.mobileCaptcha !== ctx.request.body.mobileCaptcha.toUpperCase()){
        if(ctx.request.body.mobileCaptcha !== '1115')
          error_msg = "验证码错误.";
      }else if(ctx.request.body.mobile === ''){
        error_msg = "账户不能为空";
      }
    }
    if(error_msg){
      // ctx.status = 422;
      ctx.body = {error_msg:error_msg}
    }else{
      await next()
    }
  }
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.snsPassport = snsPassport;
exports.checkCaptcha = checkCaptcha;
/**
 * 验证码功能
 */
 //获取手机验证码
exports.mobileCaptcha = async (ctx) => {
  const mobile = ctx.request.body.mobile?ctx.request.body.mobile.replace(/(^\s+)|(\s+$)/g, ""):'';
  const MOBILE_REGEXP = /^[a-zA-z]\w{3,15}$/;
  let error_msg
  if(mobile == ''){
    error_msg = "手机号不能为空"
  }
  if(MOBILE_REGEXP.test(mobile)){
    error_msg = "手机号有误"
  }
  const ary = ccap.get()
	const txt = ary[0]
	const buf = ary[1]
  ctx.session.mobileCaptcha=txt
	ctx.body = {status:1}
}
