if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const camproute = require('./routes/camp');
const reviewroute = require('./routes/reviews')
const authroute = require('./routes/auth')
const { name } = require('ejs');
const mongoose = require('mongoose');
const Campground = require('./Models/campground')
const Review = require('./Models/reviews')
const ExpressError = require('./utils/ExpressError')
const wrapAsync = require('./utils/wrapAsync')
var methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const BaseJoi = require('joi');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocaStrategy = require('passport-local')
const User = require('./Models/user')
const mongoSanitize = require('express-mongo-sanitize'); 
const sanitizeHtml = require('sanitize-html')
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
//const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL 
const secret = process.env.SECRET 

const app = express();
//Serving static files - files in local
app.use(express.static(path.join(__dirname,'views')));
app.use(express.static(path.join(__dirname,'Public')));
app.use(express.static(path.join(__dirname,'Public/Javascript_files')));

//if we need req.body - data from the form
app.use(express.urlencoded({ extended: true })) ;
app.use(methodOverride('_method'))
app.set('view engine','ejs');
app.engine('ejs',ejsMate)
app.use(mongoSanitize())

const store = MongoStore.create({
mongoUrl: dbUrl,
secret,
touchAfter: 24 * 3600 //This means don't update session whenever user refresh the page. Do it after 24hrs if no change to sessions.
})

//Session setup
sessionConfig = {
    store:store,
    secret,
    name:'Session',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
       // secure:true, - Use this option when deploying
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

//Session setup in passport
app.use(passport.initialize());
app.use(passport.session());

//Authenticate,serialize and deseriaize are the inbuilt stattic methods
// in user model due to that passportLocalMongoose plugin

passport.use(new LocaStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
.then(()=>{
    console.log('Connected to Mongo DB')
})
.catch(err =>{
    console.log('Error in connecting Mongo DB')
})



//Access this in all templates  
app.use((req,res,next)=>{
    res.locals.msg =  req.flash('success')
    res.locals.err = req.flash('error')
    res.locals.currentUser = req.user;
    next();
})

//Authentication routes
app.use('/',authroute)

//Campground Routes
app.use('/',camproute);

//Reviews Routes
app.use('/campgrounds/:id/reviews',reviewroute)

app.use(helmet());

//Joi Error Handler
app.use((err,req,res,next)=>{
    const {status=500,message} = err;
    if(!message){
     message = 'Something Went wrong'
    }else{
   res.status(status).render('error.ejs',{err})
}})

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})