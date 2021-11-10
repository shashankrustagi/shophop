const Joi = require('joi');
const { number } = require('joi');

module.exports.adminSchema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
});

module.exports.buyerSignupSchema = Joi.object({
	username: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
});

module.exports.loginSchema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
});

module.exports.sellerSignupSchema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        city: Joi.string().required()
});

module.exports.otpSchema = Joi.object({
	otp: Joi.string().required()
});

module.exports.productSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.string().required(),
        quantity: Joi.string().required(),
        category: Joi.string().required(), 
});

module.exports.addressSchema = Joi.object({
        line1: Joi.string().required(),
        line2: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pin: Joi.string().required(),
});
