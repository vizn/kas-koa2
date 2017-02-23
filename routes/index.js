const Router = require("koa-router")();
const users = require('./api/users');
const auth = require('./api/auth');
const logs = require('./api/logs');
const init = require('./api/init');
const category = require('./api/category');
const detail = require('./api/detail');

module.exports = function(app) {
  Router.use('/users',users.routes(),users.allowedMethods());
	Router.use('/auth',auth.routes(),auth.allowedMethods());
	Router.use('/logs',logs.routes(),logs.allowedMethods());
  Router.use('/init', init.routes(), init.allowedMethods());
  Router.use('/category', category.routes(), category.allowedMethods());
  Router.use('/detail', detail.routes(), detail.allowedMethods());
  Router.get('/*', (ctx, next) => {
    ctx.body = {status:'sccess'};
  });
	app.use(Router.routes());
};
