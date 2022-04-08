const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')
const sharp =require('sharp')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    age : {
        type : Number,
        validate (value){
          if(value<0){
              throw new Error('age should be in positive number')
          }
        }
    },
    email : {
        type : String,
        unique : true,
        required : true ,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email not valid")
            }
        }
    },
    password : {
        type : String,
        required : true,
        minLength : 6,
        validate(value){
            if((value.toLowerCase()).includes("password")){
                throw new Error("Password should not contain 'password'")
            }
        },
        trim : true
    }
    ,
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    uploads : {
        type : Buffer
    }

}, {
    timestamps : true
})



userSchema.methods.toJSON =  function (){
       const user = this
       
       const userObject = user.toObject()
       delete userObject.password 
       delete userObject.tokens
       delete userObject.uploads
       return userObject
}

//generateAuthToken function
//used method becoz it is on a single user

userSchema.methods.generateAuthToken = async function(){
    const user = this
   const token =  jwt.sign({ _id : user._id.toString()} , process.env.Secret_Key)
   user.tokens = user.tokens.concat({token})
   await user.save()
   
   return token
}

//creditionals
// used statics becoze its on a collection
userSchema.statics.findByCredentials = async(email , password)=>{
    const user = await User.findOne({
        email
    })
    if(!user){
        throw new Error("No user found")
    }
    const isMatched  = await bcrypt.compare(password , user.password)
    if(!isMatched){
        throw new Error('unable to login')
    }
    return user
}


//removing all the users tasks before deleting the user


userSchema.pre('remove' , async function (req,res,next){
     const user =this
     await Task.deleteMany({owner : user._id})
     next()
})


//Hashing the password
userSchema.pre('save' , async function(next){
    const user = this
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password , 8)
   }
   next()
})


const User = mongoose.model('User' , userSchema) 


    module.exports = User