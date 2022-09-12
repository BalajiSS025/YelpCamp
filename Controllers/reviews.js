const Campground = require('../Models/campground')
const Review = require('../Models/reviews')

module.exports.addreview = async(req,res)=>{
    const {reviews} = req.body;
    const {id} = req.params;
    const camp = await Campground.findById(id)
    const rev = new Review(reviews);
    rev.author = req.user._id;
    camp.reviews.push(rev);
    await rev.save();
   await camp.save();
   req.flash('success','Thanks for adding Your Review. Hope you enjoyed the stay')
    res.redirect(`/campgrounds/${id}`)
}


module.exports.deletereview = async(req,res)=>{
    const {id,reviewId} = req.params;
    const camp = await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    const Rev = await Review.findByIdAndDelete(reviewId);
    req.flash('success','Your Review Deleted successfully')
    res.redirect(`/campgrounds/${id}`)
}