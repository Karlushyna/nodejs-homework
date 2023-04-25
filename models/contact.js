const {Schema, model} = require("mongoose");
const Joi = require("joi");

const {handleMongooseError} = require("../utils");


const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
        required: [true, 'Set email for contact'],
    },
    phone: {
        type: String,
        required: [true, 'Set phone for contact'],
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },

}, {versionKey: false, timestamps: true});

contactSchema.post("save", handleMongooseError);

const addSchema = Joi.object({
    name: Joi.string().required().messages({
    "any.required": `"name" is required`,
    "string.empty": `"name" cannot be empty`
    }),
    email: Joi.string().required().messages({
    "any.required": `"email" is required`,
    "string.empty": `"email" cannot be empty`
    }),
    phone: Joi.string().required().messages({
    "any.required": `"phone" is required`,
    "string.empty": `"phone" cannot be empty`
    }),
    favorite: Joi.boolean().messages({
        "string.empty": `"missing field favorite"`,
    }),
});

const favoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
})


const schemas = {
    addSchema,
    favoriteSchema,
}

contactSchema.post("save", (error, data, next) => {
    error.status = 400;
    next();
})

const Contact = model("contact", contactSchema);

module.exports = {
    Contact,
    schemas,
}