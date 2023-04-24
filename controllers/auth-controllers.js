const {registerSchema, User} = require("../models/user");
const { HttpError } = require("../helpers");



const register = async (req, res, next)=> {
    try {
    const {error} = registerSchema.validate(req.body);
    const {email} = req.body;
    if(error) {
        throw HttpError(400, "Помилка від Joi або іншої бібліотеки валідації")
    }

    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, "Email in use");
    }
    const result = await User.create(req.body);
    res.status(201).json({
        email: result.email,
        subscription: result.subscription,
    })
    }
    catch(error){
        next(error);
    }
}

module.exports = {
    register,
}

