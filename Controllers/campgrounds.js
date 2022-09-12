const Campground = require('../Models/campground')
const {cloudinary} = require('../Cloudinary/index.js')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapBoxToken});

const Joi = require('joi');
const ExpressError = require('../utils/ExpressError.js');

module.exports.home = async(req,res)=>{
    try{
    const camps = await Campground.find();
    res.render('camp/allCamp.ejs',{camps})}
    catch(e){
        console.log(e)
    }
}

module.exports.new = (req,res)=>{
   res.render('camp/new.ejs')
}

module.exports.createcamp = async (req,res)=>{
    //Getting coordinates using mapbox
    const geodata = await geocoder.forwardGeocode({
        query: req.body.location,
        limit:1
    }).send()
    try{
    const newCamp = new Campground(req.body);
    newCamp.author = req.user._id;
    const imgArray = req.files.map(f =>({
        path: f.path,
        filename: f.filename
       }))
    newCamp.image = imgArray
    newCamp.geometry = geodata.body.features[0].geometry
    await newCamp.save();
    req.flash('success','Successfully Made a New Campground')
    res.redirect(`/campgrounds/${newCamp._id}`)}
    catch(e){
        res.send(e.message)
    }
}

module.exports.editpage = async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds')
    }
      res.render('camp/edit.ejs',{camp})
   }

module.exports.editcamp = async(req,res)=>{
    const {id} = req.params;
    //console.log(Object.values(req.body))
const camp = await Campground.findByIdAndUpdate(id,req.body)
const imgArray = req.files.map(f =>({
    path: f.path,
    filename: f.filename
   }))
camp.image.push(...imgArray)
if(req.body.deleteImage){
for(let filename of req.body.deleteImage){
    await cloudinary.uploader.destroy(filename)
}
await camp.updateOne({$pull:{image:{filename:{$in:req.body.deleteImage}}}})
}
await camp.save();
   req.flash('success','Edited the Campground')
   res.redirect(`/campgrounds/${camp._id}`)

}

module.exports.deletecamp = async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Deleted the Campground')
    res.redirect('/campgrounds')
 
}

module.exports.showcamp = async(req,res)=>{
    const {id} = req.params;
    const camps = await Campground.findById(id).populate({
      path: 'reviews',
      populate:{path: 'author'}
    }).populate('author');
    const camp = await camps.populate({path:'reviews',populate:{path:'author'}});
    if(!camps){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('camp/show.ejs',{camp});
}
