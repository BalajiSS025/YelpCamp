const mongoose = require('mongoose');
const Review = require('./reviews')
const Schema = mongoose.Schema;

//We are passing stringfied json to clusterMap.js file. So our virtuals won't available in the campground output. To avail this we
//are using the below line of code
 const opts = {toJSON: { virtuals: true }}

//https://res.cloudinary.com/dd60ziw3i/image/upload/v1661235307/YelpCamp/ryv6v0ms4sul5gmcfxzn.jpg
//Seperated as imageSchema to get the small sized images using virtuals to show it in edit page
const imageSchema = new Schema({
    path: String,
    filename:String
});

const campgroundSchema = new Schema({
    title:String,
    price:Number,
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    image:[imageSchema],
    description:String,
    location:String,
    author:{type: Schema.Types.ObjectId, ref:'User'},
    reviews:[{type: Schema.Types.ObjectId, ref: 'Review'}]
},opts)

imageSchema.virtual('thumbnail').get(function(){
  return  this.path.replace('/upload','/upload/w_300')
})

campgroundSchema.virtual('properties.popUpText').get(function(){
  return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

//Middleware to delete reviews in a campground when deleting that campground
campgroundSchema.post('findOneAndDelete',async function (data){
    if(data){
        const res = await Review.deleteMany({
            _id:{
                $in:data.reviews
            }
        })
    }
})

//Notes - data brings the entire camp data. Here we are deleting camp data so we need to delete reviews in Review
//Schema. So we are using the above middleware function.

module.exports= mongoose.model('Campground',campgroundSchema);
