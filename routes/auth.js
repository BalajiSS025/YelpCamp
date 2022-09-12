const express = require('express');
const User = require('../Models/user')
const wrapAsync = require('../utils/wrapAsync')
const passport = require('passport');
const isLogin = require('../authMiddleware.js')
const authcontrol = require('../Controllers/auth.js')

const path = require('path');
const app = express();
const router = express.Router();
app.use(express.static(path.join(__dirname,'views')));
app.use(express.urlencoded({ extended: true })) ;

router.get('/register',authcontrol.registerform)

router.post('/register',wrapAsync(authcontrol.registerUser))

router.get('/login',authcontrol.loginPage)

router.post(
    '/login',
    passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),
    wrapAsync(authcontrol.login)
)

router.get('/logout',authcontrol.logout)

router.get('/test',(req,res)=>{
    res.render('authentication/newlogin.ejs')
})


module.exports = router;
