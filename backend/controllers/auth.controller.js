import bcrypt from 'bcryptjs';
import crypto from "crypto";

import { User } from "../models/user.model.js"

import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../utils/emails.js";

export const signup = async (req,res) => {
    const {email,password,name} = req.body;
    try {
        if((!email) || (!password) || (!name) ){
            throw new Error("ALL FIELDS ARE REQUIRED!!")
        }
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({
                success: false,
                message:"User already exists."
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 6*60*60*1000 // 6 hours from creation of token.
        })
        await user.save();

        //jwt 
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email,verificationToken);

        res.status(201).json({
            success:true,
            message: "User created Successfully.",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        res.status(400).json({success: false, message:`an error occurred ${error}`});
        
    }
}

export const verifyEmail = async (req,res) => {
    const {code} = req.body;

    try {
        const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: {$gt: Date.now() }
    })

    console.log(user);

    if(!user){
        return res.status(400).json({
            success: false,
            message: "Invalid or expired verification code."
        })
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
        success: true,
        message: "Welcome E-mail sent successfully."
    })

    } catch (error) {
        console.log("Email verification failed, an error occurred: ",error);
        res.status(400).json({success: false, message:`Email verification failed: ${error.message}`});
    }

}

export const login = async (req,res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success: false,
                meaasge: "Invalid credentials."
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials."
            })
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully"
        })
    } catch (error) {
        console.log("Login failed, an error occurred: ",error );
        res.status(400).json({success: false, message:`Login failed: ${error.message}`});
    }
}

export const logout = async (req,res) => {
    res.clearCookie("token").json({
        success: true,
        message: "Logged out successfully."
    })
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User with this email does not exist."
            })
        }
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpiresAt = Date.now() + 15*60*1000;

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;

        await user.save();

        await sendPasswordResetEmail(user.email, `${process.env.RESET_PASSWORD_URL}/reset-password/${resetPasswordToken}`);

        res.status(200).json({
            success: true,
            message: "Password reset email sent successfully."
        })

    } catch (error) {
        console.log("Forgot Password process Failed, an error occurred: ",error);
        res.status(400).json({
            success: false,
            message:`Forgot Password process Failed: ${error.message}`
        })
    }
}

export const resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Password Reset Failed"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        sendResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successfully."
        })
    } catch (error) {
        console.log("Reset Password failed, an error occurred: ",error);
        res.status(400).json({
            success: false,
            message:`# Reset Password failed: ${error.message}`
        })
    }
}

export const checkAuth = async (req,res) =>{
    try {
        const user = await User.findById(req.userID).select("-password");
        
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found."
            })
        }
        res.status(200).json({
            success: true,
            user
        })
        
    } catch (error) {
        console.log("Error in checkAuth: ",error)
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}