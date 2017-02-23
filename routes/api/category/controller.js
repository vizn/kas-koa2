'use strict';
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Accounting = mongoose.model('Accounting');
const Logs = mongoose.model('Logs');
const config = require('../../config/env');

//获取基本信息
exports.getInfo = async (ctx) =>{
	const id = ctx.request.body.id?ctx.request.body.id:''
	try{
		if(id){
			const category = await Category.findById(id);
			ctx.status = 200;
			ctx.body = category;
		}
	}catch(err){
		ctx.throw(err);
	}
}
//获取图表信息
exports.getChart = async (ctx) =>{
	let labels=[], datasets_data=[], datasets_color=[]
	const type = ctx.request.body.type?ctx.request.body.type:''
	const y = ctx.request.body.year
  const m = ctx.request.body.month
	const startDate = new Date(y + "-" + m)
	let endDate = startDate
	if(m =='12'){
		endDate = new Date(Number(y)+1 + "-01")
	}else{
		endDate	= new Date(y + "-" + (Number(m)+1))
	}
	try{
		if(type){
			const category = await Category.findByType(type, ctx.req.user._id)
			for(let key in category){
				const sum = await Accounting.aggregateMoney({classId: category[key]._id, 'updated': {$lte:endDate,$gte:startDate}})
				if(sum.length>0){
					labels.push(category[key].name)
					datasets_data.push(Number(sum[0].sumMoney).toFixed(2))
					if(category[key].iconcolor){
						datasets_color.push(category[key].iconcolor)
					}else{
						let colorNum =  Math.floor(Math.random()*16777215).toString(16)
						for(let i=0; i<6-colorNum.length; i++){
							colorNum += '0'
						}
						datasets_color.push('#'+ colorNum)
					}
				}
			}
			if(labels.length>0){
				ctx.status = 200
				ctx.body = {
					labels: labels,
					datasets: [{
							data: datasets_data,
							backgroundColor: datasets_color,
							hoverBackgroundColor: datasets_color
						}]
					}
			}else{
				ctx.status = 200
			}
		}
	}catch(err){
		ctx.throw(err)
	}
}
//获取列表信息
exports.getList = async (ctx) =>{
	const type = ctx.request.body.type?ctx.request.body.type:''
	try{
		if(type){
			let category = await Category.findByType(type, ctx.req.user._id)
			let newCategory = []
			for(let key in category){
				const _pay = await Accounting.aggregateMoney({'uid': ctx.req.user._id, type: '2', accountId: category[key]._id})
				const _income = await Accounting.aggregateMoney({'uid': ctx.req.user._id, type: '1', accountId: category[key]._id})
				let pay = _pay.length>0?_pay[0].sumMoney:0
				let income = _income.length>0?_income[0].sumMoney:0
				category[key].balance = Number(category[key].money) - Number(pay) + Number(income)
					newCategory.push({
						_id:category[key]._id,
						name:category[key].name,
						icon: category[key].icon,
						money: category[key].money,
						balance:category[key].balance,
						type: category[key].type
					})
			}
			ctx.status = 200
			ctx.body = newCategory
		}
	}catch(err){
		ctx.throw(err)
	}
}
//编辑信息
exports.updateCategory = async (ctx) => {
	console.log(ctx.request.body)
	const id = ctx.request.body.id||''
	const name = ctx.request.body.name?ctx.request.body.name.replace(/(^\s+)|(\s+$)/g, ""):''
	const type = ctx.request.body.type||''
	const icon = ctx.request.body.icon?ctx.request.body.icon.replace(/(^\s+)|(\s+$)/g, ""):''
	const NAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/

	let error_msg; 
	if(name === ''){
		error_msg = "名称不能为空";
	}else if(type === ''){
		error_msg = "类型不能为空";
	}else if(!NAME_REGEXP.test(name)){
    error_msg = "名称不符合规定";
  }else if(name.length >16){
		error_msg = "名称不能超过8个字";
	}else {
		await Category.findOne({uid: ctx.req.user._id, name: name }, (err, user) => {
      if (err) { error_msg =  err }
      if (user) { if(type !=0) error_msg = '名称已存在'}
		})
	}
	if(error_msg){
		// ctx.status = 422;
	  ctx.body = {error_msg:error_msg};
		return;
	}
	try{
		let category;
		if(id === '') {
			let newCategory = new Category(ctx.request.body);
			newCategory.uid = ctx.req.user._id;
			category = newCategory.save();
		}else {
			category = await Category.findByIdAndUpdate(id,ctx.request.body,{new:true});
		}
    ctx.status = 200;
    ctx.body = {success:true, category:category};
	}catch(err){
		ctx.throw(err);
	}
}
