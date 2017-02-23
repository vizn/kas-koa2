/**
记账数据表
**/
'use strict';
const mongoose = require('mongoose');
const	Schema = mongoose.Schema;

let AccountingSchema = new Schema({
  uid: {
		type:Schema.Types.ObjectId,
		ref:'User'
	},
	content: {
    type:String,
    trim: true
  },
  money: {
    type: Number,
    default: 0
  },
  classId: {
		type:Schema.Types.ObjectId,
		ref:'Category'
	},
  accountId:{
    type:Schema.Types.ObjectId,
		ref:'Category'
  },
  type: String, //1支出，2收入
	created: {
		type: Date,
		default: Date.now
	},
  updated: {
		type: Date,
		default: Date.now
	}
})

AccountingSchema.statics.findWithPage = function(size, whereStr, orderStr){
  return this.find(whereStr)
    .populate('classId').limit(size).sort(orderStr)
    .exec(function (err, res) {
    if (err) console.log(err)
    else return res
  })
}
AccountingSchema.statics.aggregateMoney = function(whereStr){
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
module.exports = mongoose.model('Accounting', AccountingSchema);
