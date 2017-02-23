
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const User = mongoose.model('User');
const config = require('../../config/env');

//初始化数据
const json = [
  {name: '餐饮', type: 2, icon:'cutlery'},
  {name: '交通', type: 2, icon:'bus'},
  {name: '孩子', type: 2, icon:'child'},
  {name: '零食', type: 2, icon:'yelp'},
  {name: '社交', type: 2, icon:'group'},
  {name: '办公', type: 2, icon:'paperclip'},
  {name: '学习', type: 2, icon:'pencil'},
  {name: '通讯', type: 2, icon:'phone'},
  {name: '服饰', type: 2, icon:'jersey'},
  {name: '数码', type: 2, icon:'camera'},
  {name: '旅游', type: 2, icon:'plane'},
  {name: '医疗', type: 2, icon:'medkit'},
  {name: '维修', type: 2, icon:'wrench'},
  {name: '运动', type: 2, icon:'futbol-o'},
  {name: '娱乐', type: 2, icon:'microphone'},
  {name: '美容', type: 2, icon:'neuter'},
  {name: '宠物', type: 2, icon:'github-alt'},
  {name: '书籍', type: 2, icon:'book'},
  {name: '日杂', type: 2, icon:'plug'},
  {name: '汽车', type: 2, icon:'auto'},
  {name: '住房', type: 2, icon:'home'},
  {name: '长辈', type: 2, icon:'elder'},
  {name: '礼物', type: 2, icon:'gift'},
  {name: '礼金', type: 2, icon:'cash-gift'},
  {name: '还钱', type: 2, icon:'repay'},
  {name: '捐赠', type: 2, icon:'donate'},
  {name: '理财', type: 2, icon:'manage-money'},


  {name: '兼职', type: 1, icon:'avtimer'},
  {name: '工资', type: 1, icon:'salary'},
  {name: '投资收益', type: 1, icon:'earnings'},
  {name: '礼金', type: 1, icon:'indent'},
  {name: '其他收入', type: 1, icon:'income'},


  {name: '信用卡', type: 0, icon:'credit-card'},
  {name: '借记卡', type: 0, icon:'debit-card'},
  {name: '现金', type: 0, icon:'account'},
  {name: '微信', type: 0, icon:'wechat'},
  {name: '支付宝', type: 0, icon:'alipay'}
]

exports.initData = async (ctx, next) =>{
  let isok = 0
  try{
    for(let key in json){
      let newCategory = new Category(ctx.request.body)
      newCategory.uid = ctx.req.user._id
      newCategory.name = json[key].name
      newCategory.type = json[key].type
      newCategory.icon = json[key].icon
      let colorNum =  Math.floor(Math.random()*16777215).toString(16)
      for(let i=0; i<6-colorNum.length; i++){
        colorNum += '0'
      }
      newCategory.iconcolor = "#"+colorNum  //随机生成颜色
      if(newCategory.save()){
        isok++
        //初始化完成更新用户状态
        ctx.req.user.status = 1
        await User.findByIdAndUpdate(ctx.req.user._id, ctx.req.user, {new:true});
      }
    }
    if(isok>0){
      ctx.status = 200;
      ctx.body = {success:true};
    }else{
      ctx.body = {success:false};
    }
  }catch(err){
    ctx.throw(err)
  }
}
