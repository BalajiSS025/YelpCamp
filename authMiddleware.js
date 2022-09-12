const Campground = require('./Models/campground')
const Review = require('./Models/reviews')

const isLogin = function(req,res,next){
    req.session.returnTo = req.originalUrl;
    if(!req.isAuthenticated()){
    req.flash('error','You Must login to access this page')
    return res.redirect('/login')
}
next();
}


module.exports = isLogin;