const transport = require("../middlewares/sendMail");
const { signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema, accpetFPSchema } = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const jwt = require("jsonwebtoken");


//Create new user
async function signup(req, res) {
    const { email, password } = req.body;
    try {
        const { error } = signupSchema.validate({ email, password });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(409).json({ success: false, message: "User already exists!" });
        }
        const hashedPassword = await doHash(password, 12);
        const newUser = new User({
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ success: true, message: "Account created successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Failed to SignUp" });
    }
}

async function signin(req, res) {
    const { email, password } = req.body;
    try {
        const { error, value } = signinSchema.validate({ email, password });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const existingUser = await User.findOne({ email }).select("+password");
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist!" });
        }
        const isValidPassword = await doHashValidation(password, existingUser.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
            },process.env.TOKEN_SECRET,
            { expiresIn: "8h"}
        );

        res.cookie("Authorization", "Bearer" + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({ success: true, message: "Logged in successfully", token });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ success: false, message: "Faile to Signin" });
    }
}

async function signout(req,res){
    res.clearCookie('Authorization').status(200).json({success : true, message : "Logged successfully"});
}

async function sendVerificationCode(req, res) {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist!" });
        }
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "You are already verified!" });
        }

        const codeValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Verification Code",
            html: `Here is you one time password(OTP) : <h1>${codeValue}</h1>. <br> Do not share with anyone.`,
        });

        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = await hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now()
            await existingUser.save();
            return res.status(200).json({ success: true, message: "Code sent!" });
        }

        res.status(400).json({ success: false, message: "Failed to send Code!" });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Failed to send verification code" });
    }
}

async function verifyVerificationCode(req, res) {
    const { email, providedCode } = req.body;
    try {
        const { error } = acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select("+verificationCode +verificationCodeValidation");
        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "You are already verified!" });
        }
        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "Something is wrong with the code" });
        }

        // Convert verificationCodeValidation to Date and check expiration
        //const verificationTime = new Date(existingUser.verificationCodeValidation);
        if (Date.now() - existingUser.verificationCodeValidation> 5 * 60 * 1000) { // 5 minutes
            return res.status(400).json({ success: false, message: "Code expired" });
        }

        const hashedCodeValue = await hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();

            return res.status(200).json({ success: true, message: "Account verified" });
        }

        return res.status(400).json({ success: false, message: "Invalid verification code!" });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Failed to verify code" });
    }
}

async function changePassword(req, res) {
    const {userId , verified} = req.user;
    const {oldPassword, newPassword} = req.body;
    try {
        const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        } 
        if(!verified){
            return res.status(400).json({ success: false, message: "Not verified" });
        }
        const existingUser = await User.findOne({_id: userId}).select("+password");
        if(!existingUser){
            return res.status(400).json({ success: false, message: "User not exist!"});
        } 
        const result = await doHashValidation(oldPassword , existingUser.password)
        if(!result){
            return res.status(400).json({ success: false, message: "Invalid Password" });
        }  
        const hashedPassword = await doHash(newPassword,12);
        existingUser.password = hashedPassword;
        await existingUser.save();
        return res.status(200).json({ success: true, message: "Password Updated" });

    } catch (error) {
        console.log(error);
    }
}

async function sendForgetPasswordCode(req, res) {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist!" });
        }
       
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code


        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Forget Password Code",
            html: `Here is you one time password(OTP) : <h1>${codeValue}</h1>. <br> Do not share with anyone.`,
        });

        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = await hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now()
            await existingUser.save();
            return res.status(200).json({ success: true, message: "Code sent!" });
        }

        res.status(400).json({ success: false, message: "Failed to send Code!" });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Failed to send verification code" });
    }
}

async function verifyForegtPasswordCode(req, res) {
    const { email, providedCode, newPassword } = req.body;
    try {
        const { error } = accpetFPSchema.validate({ email, providedCode, newPassword });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation");
        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }
        if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            return res.status(400).json({ success: false, message: "Something is wrong with the code" });
        }

        // Convert verificationCodeValidation to Date and check expiration
        //const verificationTime = new Date(existingUser.verificationCodeValidation);
        if (Date.now() - existingUser.forgotPasswordCodeValidation> 5 * 60 * 1000) { // 5 minutes
            return res.status(400).json({ success: false, message: "Code expired" });
        }

        const hashedCodeValue = await hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword , 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation= undefined;
            await existingUser.save();

            return res.status(200).json({ success: true, message: "Password Updated!!"});
        }

        return res.status(400).json({ success: false, message: "Invalid verification code!" });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Failed to verify code" });
    }
}


module.exports = {
    signup,
    signin,
    signout,
    sendVerificationCode,
    verifyVerificationCode,
    changePassword,
    sendForgetPasswordCode,
    verifyForegtPasswordCode,
};

