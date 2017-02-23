'use strict';
const router = require("koa-router")();
const controller = require('./controller');
const auth = require('../auth/auth.service');


router.get('/', auth.isAuthenticated(), controller.initData);
module.exports = router;
