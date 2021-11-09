const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const sellerSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Email cannot be blank!']
	},
	username: {
		type: String,
		required: [true, 'Username cannot be blank!']
	},
	password: {
		type: String,
		required: [true, 'Password cannot be blank!']
	},
	phone: {
		type: String,
		required: [true, 'Phone number cannot be blank!']
	},
	city: {
		type: String,
		required: [true, 'City cannot be blank!']
	},
	document:  {
		type: String,
		required: [true, 'City cannot be blank!']
	},
	isApproved: {
		type: Boolean,
		default: false
	},
	suspended: {
		type: Boolean,
		default: false
	},
	otp: String
})

sellerSchema.statics.validateSeller = async function (email, password) { 
	const seller = await this.findOne({ email });
	const isValid = await bcrypt.compare(password, seller.password); 
	return isValid ? seller : false;
}

sellerSchema.statics.validateOTP = async function (email, otp) { 
	const seller = await this.findOne({ email });
	const isValid = await bcrypt.compare(otp, seller.otp); 
	return isValid ? seller: false;
}


sellerSchema.pre('save', async function (next) {
	if(!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
})


module.exports = mongoose.model('Seller', sellerSchema);
