const Koa = require('koa');
const app = new Koa()

const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('koa-cors');
const session = require("koa-generic-session");
const passport = require('koa-passport');
const RedisStore = require('koa-redis');
const config = require('./routes/config/env');

// 连接数据库.
var db = mongoose.createConnection();
db.openUri(config.mongo.uri);
const modelsPath = path.join(__dirname, 'routes/model');
fs.readdirSync(modelsPath).forEach(function (file) {
	if (/(.*)\.(js$|coffee$)/.test(file)) {
		require(modelsPath + '/' + file);
	}
});
//mongoose promise 风格
mongoose.Promise = require('bluebird');
//mongoose.Promise = global.Promise;

// // 初始化数据
// if(config.seedDB && config.env === 'development') {
// 	const initData = require('./config/seed');
// 	initData();
// }
app.use(convert(cors(config.corsOptions)))
app.keys = [config.session.secrets]
app.use(convert(session({
	key: "keepaccount.sid",
	store: RedisStore({
		host:config.redis.host,
		port:config.redis.port,
		auth_pass:config.redis.password || ''
	}),
	cookie: config.session.cookie
})))
app.use(convert(passport.initialize()))
app.use(convert(passport.session()))
app.use(convert(json()))
app.use(convert(logger()))
app.use(convert(bodyparser()))
require('./routes/index')(app)

module.exports = app
