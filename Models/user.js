const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Read this doc if you want to know about passportLocalMongoose
//https://github.com/saintedlama/passport-local-mongoose#readme

const userSchema = new Schema ({
email:{
    type:String,
    required:true,
    unique:true
}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema)
