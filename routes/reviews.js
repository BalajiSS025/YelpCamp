const express = require('express');
const Campground = require('../Models/campground')
const Review = require('../Models/reviews')
const wrapAsync = require('../utils/wrapAsync')
//const isReviewAuthor = require('../authMiddleware.js')
const reviewcontrol = require('../Controllers/reviews.js') ;
const ExpressError = require('../utils/ExpressError.js')
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const path = require('path');
const app = express();
const router = express.Router({mergeParams:true});
app.use(express.static(path.join(__dirname,'views')));
app.use(express.urlencoded({ extended: true })) ;

const isLogin = function(req,res,next){
    req.session.returnTo = req.originalUrl;
    if(!req.isAuthenticated()){
    req.flash('error','You Must login to access this page')
    return res.redirect('/login')
}
next();
}

const isReviewAuthor = async function (req,res,next){
    const {id,reviewId} = req.params;
    const rev = await Review.findById(reviewId);
    if(!rev.author.equals(req.user._id)){
        req.flash('error',"Sorry! You don't have permission to do this")
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//Sanitize Html with Joi
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

//Joi Middleware
const verify = function(req,res,next){
const verifySchema = Joi.object({
    reviews: Joi.object({
    body : Joi.string().required().escapeHTML(),
    rating:Joi.number().required().min(0),
}).required()
})
const {error} = verifySchema.validate(req.body)
if(error){
            const msg = error.details.map(el=>el.message).join(',')
            console.log(error.details)
            throw new ExpressError(400,msg)
        }
        else{
            next()
        }
}

//Add Reviews 

router.post('/',isLogin,verify,wrapAsync(reviewcontrol.addreview))

//Delete Reviews
router.delete('/:reviewId',isLogin,isReviewAuthor,wrapAsync(reviewcontrol.deletereview))

module.exports = router;

