import { User } from "../models/user.model.js"
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/emails.js";

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
    res.send("Login Route.")
}

export const logout = async (req,res) => {
    res.send("Logout Route.")
}