'use strict';
const router = require("koa-router")();
const controller = require('./controller');
const auth = require('../auth/auth.service');



router.post('/info', auth.isAuthenticated(), controller.getInfo); //获取对于类别ID信息
router.post('/update', auth.isAuthenticated(), controller.updateCategory);
router.post('/list', auth.isAuthenticated(), controller.getList);
router.post('/chart', auth.isAuthenticated(), controller.getChart);
module.exports = router; 
