const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const jimp = require("jimp");
const nanoid = require("nanoid");

const {schemas, User} = require("../models/user");
const {SECRET_KEY} = require("../private");
const { HttpError, sendEmail } = require("../helpers");
const {BASE_URL} = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next)=> {
    try {
    const {error} = schemas.registerSchema.validate(req.body);
    const {email, password} = req.body;
    if(error) {
        throw HttpError(400, "Помилка від Joi або іншої бібліотеки валідації")
    }

    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationCode = nanoid();


    const result = await User.create({...req.body, password: hashPassword, avatarURL, verificationCode});

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click verify email</a>`    
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        email: result.email,
        subscription: result.subscription,
    })
    }
    catch(error){
        next(error);
    }
}

const verify = async(req, res, next)=> {
try{
    const {verificationCode} = req.params;
    const user = await User.findOne({verificationCode});
    if(!user){
        throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {verify: true, verificationCode: ""});

    res.json({
        message: "Verification successful",
    })
}
catch(error){
    next(error);
}
}

const resendVerify = async (req, res, next) => {
    try {
        const { error } = schemas.emailSchema.validate(req.body);
        if (error) {
        throw HttpError(400, "Помилка від Joi або іншої бібліотеки валідації");
    }
    const { email } = req.body;
    const user = await User.findOne({email});
        if(!user) {
        throw HttpError(404, "User not found")
    }
        if(user.verify) {
        throw HttpError(400, "Verification has already been passed")
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Verification email sent</p>`,
    };

    await sendEmail(verifyEmail);

    res.json({
        message: "Verification email sent"
        })
    } catch (error) {
        next(error);
    }
};

const login = async(req, res, next) => {
    try {
        const {error} = schemas.loginSchema.validate(req.body);
        const {email, password} = req.body;
        if(error) {
        throw HttpError(400, "Помилка від Joi або іншої бібліотеки валідації")
        }

        const user = await User.findOne({email});
        if(!user) {
            throw HttpError(401, "Email or password is wrong");
        }
        if(!user.verify) {
            throw HttpError(401, "Email not verify");
        }
        const passwordCompare = await bcrypt.compare(password, user.password);

        if(!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
        }

        const payload = {
        id: user._id
        }

        const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});

        await User.findByIdAndUpdate(user._id, {token});

        res.json({
        token,
        user
        })
    } catch (error) {
        next(error);
    }
    }

    const getCurrent = async(req, res, next) => {
        try {
            const {error} = schemas.registerSchema.validate(req.body);
            if(error) {
            throw HttpError(400, "Помилка від Joi або іншої бібліотеки валідації")
            }
            const {email, subscription} = req.user;

            res.json({
            email,
            subscription
            })
        } catch (error) {
            next(error);
        }

        }

    const logout = async(req, res, next) => {
        try {
            const {error} = schemas.registerSchema.validate(req.body);
            if(error) {
                throw HttpError(400, "Помилка від Joi або іншої бібліотеки валідації")
            }
            const {_id} = req.user;
        
            await User.findByIdAndUpdate(_id, {token: ""});
        
            res.json({
                message: "Logout success"
            })
            } catch (error) {
            next(error);
            }
        }

        const updateAvatar = async (req, res, next) => {
            try {
                const {_id} = req.user;
                const {path: tempUpload, filename} = req.file;
                const avatarName = `${_id}_${filename}`;
                jimp.read(`./temp/${filename}`)
                .then((img) => {
                    return img
                    .resize(250, 250)
                    .write(`./public/avatars/${avatarName}`);
                })
                .catch((err) => {
                    console.log(err);
                });
                const resultUpload = path.join(avatarsDir, avatarName);
                await fs.rename(tempUpload, resultUpload);
                const avatarURL = path.join("avatars", avatarName);
                await User.findByIdAndUpdate(_id, {avatarURL});

                res.json({avatarURL});
    

            } catch (error) {
                next(error);
            }
        };



module.exports = {
    register,
    login,
    getCurrent,
    logout,
    updateAvatar,
    verify,
    resendVerify
}

