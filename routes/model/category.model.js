/**
记账类型表
**/
'use strict';
const mongoose = require('mongoose');
const	Schema = mongoose.Schema;

let CategorySchema = new Schema({
  name: String,
  parentid: {
  	type: String,
  	default: '0',
  },
  type: String, //1支出，2收入，0资金账户
  uid: {
		type:Schema.Types.ObjectId,
		ref:'User'
	},
  hide: {
    type: Boolean,
    default: false
  },
  icon: String,
  iconcolor: String,
  money: {
    type: Number,
    default: 0
  }
})

CategorySchema.statics.findByType = function(type, uid, callback){
  return this.find({type:type, uid: uid},
    function (err, res) {
      if (err) console.log(err)
      else return res
    }
  )
}
CategorySchema.statics.aggregateMoney = function(whereStr){
  return this.aggregate()
    .match(whereStr)
		.group({
       		_id: null,
        	sumMoney: {$sum: "$money"},
    })
    .exec(function (err, res) {
      if (err) console.log(err)
      else return res
    })
}
module.exports = mongoose.model('Category', CategorySchema);
