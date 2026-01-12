import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    resetPasswordToken: String, // To reset the password  
    resetPasswordExpiresAt: Date, // Expiration time of the password Token (maybe 30 mins or 1 hour from the token being generated)
    verificationToken: String, // Verification Token for verifying a user account.
    verificationTokenExpiresAt: Date // Expiration time of the verification Token (maybe 6 hours or so to increase security)
},{timestamps: true}) //timestamps gives created at and updated at fields.

export const User = mongoose.model('User',userSchema);