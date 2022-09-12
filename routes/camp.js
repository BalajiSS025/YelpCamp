const express = require('express');
const Campground = require('../Models/campground')
const wrapAsync = require('../utils/wrapAsync')
const isLogin = require('../authMiddleware.js')
//const isAuthor = require('../authMiddleware.js')
const campcontrol = require('../Controllers/campgrounds.js')
const multer  = require('multer')
const {storage} = require('../Cloudinary/index.js')
const upload = multer({ storage })
const ExpressError = require('../utils/ExpressError.js')
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const path = require('path');
const app = express();
const router = express.Router();
app.use(express.static(path.join(__dirname,'views')));
app.use(express.urlencoded({ extended: true })) ;

const isAuthor = async function (req,res,next){
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author._id.equals(req.user._id)){
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
       title : Joi.string().required().escapeHTML(),
       price : Joi.string().required().escapeHTML(),
       location:Joi.string().required().escapeHTML(),
       price:Joi.number().required().min(0),
       description:Joi.string().escapeHTML()
    }).required()
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



//Show all campgrounds
router.get('/campgrounds',wrapAsync(campcontrol.home))

// //test page
// router.get('/campgrounds/:id/test',wrapAsync(async(req,res,next)=>{
//     const {id} = req.params;
//     const camp = await Campground.findById(id);
//     res.render('camp/test.ejs',{camp});
// }))

//Create new campground
router.get('/campgrounds/new',isLogin,campcontrol.new)

router.post('/campgrounds',isLogin,upload.array('image'),verify,wrapAsync(campcontrol.createcamp))

//Tested to add cloudinary image path to campground 
//router.post('/campgrounds',upload.array('image'),(req,res)=>{
//    // console.log(req.body,req.files)
//    const testArray = req.files.map(f =>({
//     url: f.path,
//     filename: f.filename
//    }))
//    console.log(testArray)
//     res.send('It Worked')
// })

//Edit Campground
router.get('/campgrounds/:id/edit',isLogin,isAuthor,wrapAsync(campcontrol.editpage))

router.put('/campgrounds/:id',isAuthor,upload.array('image'),verify,wrapAsync(campcontrol.editcamp))

//Delete Campground
router.delete('/campgrounds/:id',isLogin,isAuthor,wrapAsync(campcontrol.deletecamp))

//Show campground detail
router.get('/campgrounds/:id',wrapAsync(campcontrol.showcamp))


router.get('/',(req,res)=>{
    res.render('webHome.ejs')
})
router.get('/foot',(req,res)=>{
    res.render('camp/joitest.ejs')
})

module.exports = router;