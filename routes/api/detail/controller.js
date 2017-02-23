'use strict';
const mongoose = require('mongoose');
const Accounting = mongoose.model('Accounting');
const Category = mongoose.model('Category');
const Logs = mongoose.model('Logs');
const config = require('../../config/env');

//获取基本信息
exports.getInfo = async (ctx) =>{
	const id = ctx.request.body.id?ctx.request.body.id:''
	try{
    if(id){
      const account = await Accounting.findById(id);
  		ctx.status = 200;
  		ctx.body = account;
    }
	}catch(err){
		ctx.throw(err);
	}
}
//获取列表信息
exports.getMonthSum = async (ctx) =>{
  const y = ctx.request.body.year?ctx.request.body.year:null
  const m = ctx.request.body.month?ctx.request.body.month:null
	if(y != 'undefined' && m != 'undefined'){
		const startDate = new Date(y + "-" + m)
		let endDate = startDate
		if(m =='12'){
			endDate = new Date(Number(y)+1 + "-01")
		}else{
			endDate	= new Date(y + "-" + (Number(m)+1))
		}
		try{
			const pay = await Accounting.aggregateMoney({'uid': ctx.req.user._id, type: '2', 'updated': {$lte:endDate,$gte:startDate}})
			const income = await Accounting.aggregateMoney({'uid': ctx.req.user._id, type: '1', 'updated': {$lte:endDate,$gte:startDate}})
			ctx.status = 200
			ctx.body = {pay:pay.length>0?pay[0].sumMoney:0, income:income.length>0?income[0].sumMoney:0}
		}catch(err){
			ctx.throw(err)
		}
	}else{
		try{
			const pay = await Accounting.aggregateMoney({'uid': ctx.req.user._id, type: '2'})
			const income = await Accounting.aggregateMoney({'uid': ctx.req.user._id, type: '1'})
			const init = await Category.aggregateMoney({'uid': ctx.req.user._id, type: '0'})
			let sum = 0
			if(init.length>0){
				sum = Number(init[0].sumMoney)
			}
			if(pay.length>0){
				sum = sum - Number(pay[0].sumMoney)
			}
			if(income.length>0){
				sum = sum + Number(income[0].sumMoney)
			}
			ctx.status = 200
			ctx.body = {pay:pay.length>0?pay[0].sumMoney:0, income:income.length>0?income[0].sumMoney:0, sum:sum}
		}catch(err){
			ctx.throw(err)
		}
	}
}
//获取列表信息
exports.getList = async (ctx) =>{
	console.log(ctx.request.body)
  const y = ctx.request.body.year
  const m = ctx.request.body.month
	const size = ctx.request.body.size ? Number(ctx.request.body.size): 15
	const last_id = ctx.request.body.last_id ? ctx.request.body.last_id : 0
	const startDate = new Date(y + "-" + m)
	let endDate = startDate
	if(m =='12'){
		endDate = new Date(Number(y)+1 + "-01")
	}else{
		endDate	= new Date(y + "-" + (Number(m)+1))
	}
	let whereStr
	if(last_id == 0){
		whereStr = {'uid': ctx.req.user._id, 'updated': {$lte:endDate,$gte:startDate}}
	}else{
		whereStr = {'uid': ctx.req.user._id, 'updated': {$lte:endDate,$gte:startDate},'_id':{$lt: last_id}}
	}
	if(ctx.request.body.className){
		const category = await Category.findOne({name: ctx.request.body.className})
		whereStr.classId = category._id
	}
	const orderStr = {updated: -1, _id: -1} //按时间、id倒序排序
	try{

		const list = await Accounting.findWithPage(size, whereStr, orderStr)
		ctx.status = 200
		ctx.body = {data:list}
	}catch(err){
		ctx.throw(err)
	}
}
// exports.getLatest(model,count)
// exports.getWithPage(last_id,size)

//编辑信息
exports.update = async (ctx) => {
	const id = ctx.request.body._id?ctx.request.body._id:''
  const classId = ctx.request.body.classId?ctx.request.body.classId.replace(/(^\s+)|(\s+$)/g, ""):''
	const accountId = ctx.request.body.accountId?ctx.request.body.accountId.replace(/(^\s+)|(\s+$)/g, ""):''
	const type = ctx.request.body.type?ctx.request.body.type:''
  const content = ctx.request.body.content?ctx.request.body.content.replace(/(^\s+)|(\s+$)/g, ""):''
  const money = ctx.request.body.money?ctx.request.body.money:''
  const updated = ctx.request.body.updated?ctx.request.body.updated:''
	let error_msg;
	if(classId === ''){
		error_msg = "请选择分类";
	}else if(accountId === ''){
		error_msg = "请选择账户";
	}else if(type === ''){
    error_msg = "请选择收入或支出";
  }else if(money === ''){
		error_msg = "请填写金额";
	}else if(updated === ''){
		error_msg = "请选择日期";
	}
	if(error_msg){
		// ctx.status = 422;
	  ctx.body = {error_msg:error_msg};
		return;
	}
	try{
		let info;
		if(id === '') {
      delete ctx.request.body._id;
			let newAccounting = new Accounting(ctx.request.body);
			newAccounting.uid = ctx.req.user._id;
      if(await newAccounting.save()){
        ctx.status = 200;
        ctx.body = {success:true};
      }
		}else {
			if(await Accounting.findByIdAndUpdate(id,ctx.request.body,{new:true})){
        ctx.status = 200;
        ctx.body = {success:true, update:true};
      }
		}

	}catch(err){
		ctx.throw(err);
	}
}
exports.getData = async (ctx) => {

}
