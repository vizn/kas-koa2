'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Logs = mongoose.model('Logs');

const config = require('../../config/env')

//获取用户基本信息
exports.getInfo = async (ctx) =>{
	const userId = ctx.req.user._id;
	try{
		const user = await User.findById(userId);
		ctx.status = 200;
		ctx.body = user.userInfo;
	}catch(err){
		ctx.throw(err);
	}
}
//更新绑定手机号
exports.updateMobile = async (ctx) => {
	const user = ctx.req.user;
	user.mobile = ctx.request.body.mobile
	const newUser = await User.findByIdAndUpdate(ctx.req.user._id, user,{new:true});
	if(newUser){
		ctx.status = 200;
    ctx.body = {success:true};
	}
}

//添加用户
exports.addUser = async (ctx, next) => {
	const nickname = ctx.request.body.username?ctx.request.body.username.replace(/(^\s+)|(\s+$)/g, ""):'';
	const email = ctx.request.body.email?ctx.request.body.email.replace(/(^\s+)|(\s+$)/g, ""):'';
	const verify = ctx.request.body.verify?ctx.request.body.verify.replace(/(^\s+)|(\s+$)/g, ""):'';
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
  const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	let error_msg;
	if(nickname === ''){
		error_msg = "呢称不能为空";
	}else if(email === ''){
		error_msg = "邮箱地址不能为空";
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = "呢称不合法";
	}else if(email.length <=4 || email.length > 30 || !EMAIL_REGEXP.test(email)){
		error_msg = "邮箱地址不合法";
	}
	if(error_msg){
		// ctx.status = 422;
	  ctx.body = {error_msg:error_msg};
		return;
	}
	try{
		let newUser = new User(ctx.request.body);
		newUser.role = 'user';
		const user = newUser.save();
		Logs.create({
			uid: ctx.req.user._id,
			content:"创建新用户 "+ (user.email || user.nickname),
			type:"user"
		});
		this.status = 200;
		ctx.body = {success:true,user_id:user._id};
	}catch(err){
		ctx.throw(err);
	}
}
