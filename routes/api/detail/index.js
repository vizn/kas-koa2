'use strict';
const router = require("koa-router")();
const controller = require('./controller');
const auth = require('../auth/auth.service');



router.post('/info', auth.isAuthenticated(), controller.getInfo); //获取对应ID信息
router.post('/update', auth.isAuthenticated(), controller.update);
router.post('/list', auth.isAuthenticated(), controller.getList); //获取列表信息
router.post('/data', auth.isAuthenticated(), controller.getData); //获取数据集合
router.post('/monthSum', auth.isAuthenticated(), controller.getMonthSum); //获取数据集合
module.exports = router;
