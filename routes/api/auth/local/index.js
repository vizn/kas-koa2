const mongoose = require('mongoose');
const router = require("koa-router")();
const passport = require('koa-passport');
const User = mongoose.model('User');
const auth = require('../auth.service');


router.post('/',  auth.checkCaptcha(), (ctx, next) =>{
  return passport.authenticate('local', function(user, info, status) {
    if (user === false) {
      ctx.status = 401
      ctx.body = {success: false }
    } else {
      const token = auth.signToken(user._id);
      ctx.body = {token: token};
    }
  })(ctx, next)
})

router.post('/wechat', async (ctx) => { 
  const openid = ctx.request.body.openid || null
  const nickname = ctx.request.body.nickname || null
  let user
  if(openid){
    user = await User.findOne({openid: openid})
    if (!user) {
      let newUser = new User({
        openid: openid,
        nickname: nickname,
        provider:'wechat',
        wechat: ctx.request.body
      })
      user = await newUser.save()
    }
  }
  if (!user) {
    ctx.status = 401
    ctx.body = {success: false }
  } else {
    ctx.req.user = user
    const token = auth.signToken(user._id)
    ctx.body = {token: token}
  }
})
module.exports = router;
