const { types } = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email :{
        type : String,
        required : [true, 'Email is required!'],
        trim : true,
        unique : [true , "Email must be unique"],
        minLength : [5 , "Email must have 5 characters!"],
        lowercase : true,
    },
    password : {
        type : String,
        required : [true, 'Password is required!'],
        trim : true,
        select : false,
    },
    verified: {
        type : Boolean,
        default: false,
    },
    verificationCode: {  // ✅ Added field
        type: String,  // Store hashed code (HMAC)
        select: false, // Prevent automatic selection
    },
    verificationCodeValidation : {
        type : Number,
        select : false,
    },
    forgotPasswordCode : {
        type : String,
        select : false,
    },
    forgotPasswordCodeValidation : {
        type : Number,
        select : false,
    },
}, { timestamps : true});

module.exports = mongoose.model("User",userSchema);