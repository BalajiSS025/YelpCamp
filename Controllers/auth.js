const User = require('../Models/user')
const ExpressError = require('../utils/ExpressError.js');

module.exports.registerform = (req,res)=>{
    res.render('authentication/register.ejs')
}

module.exports.registerUser = async(req,res)=>{
    try{
    const{username,email,password} = req.body;
    const user = new User({username,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,function(err,next) {
        if (err) { return next(err); }
    req.flash('success',`Welcome to Yelcamp ${username}`)
    return res.redirect('/campgrounds')})
    }
    catch(e){
    req.flash('error',e.message)
    res.redirect('/register')
    }
    }

module.exports.loginPage = (req,res)=>{
    req.session.pathcame = req.session.returnTo;
    res.render('authentication/login.ejs')
}

module.exports.login = async(req,res)=>{
    req.flash('success','Welcome Back!')
    res.redirect('/campgrounds')
   
}

// module.exports.logout = (req, res) => {
//     req.logout()
//     .get((req, res) => {
//         req.logout(function(err) {
//              if (err) { return next(err); }
//              req.flash('success', "Goodbye!");
//              res.redirect('/campgrounds');
//     });
//     // req.session.destroy();
    
// }

module.exports.logout = (req,res,next)=>{
    req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success','GoodBye!')
    res.redirect('/campgrounds');
  })
}