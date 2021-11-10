const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
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
	isApproved: {
		type: Boolean,
		default: false
	}
})

adminSchema.statics.validateAdmin = async function (username, password) { 
	const admin = await this.findOne({ username });
	const isValid = await bcrypt.compare(password, admin.password); 
	return isValid ? admin : false;
}

adminSchema.statics.validateOTP = async function (email, otp) { 
	const admin = await this.findOne({ email });
	const isValid = await bcrypt.compare(otp, admin.otp); 
	return isValid ? admin : false;
}


adminSchema.pre('save', async function (next) {
	if(!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
})


module.exports = mongoose.model('Admin', adminSchema);
