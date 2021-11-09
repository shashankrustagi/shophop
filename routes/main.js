const express = require('express');
const router  = express.Router();
const nodemailer=require('nodemailer');
const alert = require('alert')
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config()

const Buyer = require('../models/buyer')
const Seller = require('../models/seller')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const docPath = path.join(__dirname, '../public/documents');
        cb(null, docPath);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage })

let transporter = nodemailer.createTransport({
   port: 465,
   service : 'Gmail',
   auth: {
     user: process.env.EMAIL,
     pass: process.env.EPASS,
   }
});

router.get('/', (req, res) => {
	res.render('landing')
})

router.get('/aboutus', (req, res) => {
	res.render('about')
})

router.get('/signup', (req, res) => {
	res.render('buyersignup')
})

router.post('/signup', async(req, res) => {
	const { username, email, password } = req.body;
	const buyer = new Buyer({ username, email, password })
	await buyer.save();
	res.redirect('/login')
})

router.get('/login', (req, res) => {
	res.render('buyerlogin')
	req.session.destroy()
})

router.post('/login', async(req, res) => {
	const { email, password } = req.body;
	var buyerExist = await Buyer.findOne({ email });
	var isValid = false
	if(buyerExist){
		isValid = await Buyer.validateBuyer(email, password)
	}
	if(buyerExist && isValid){
		const isSuspended = buyerExist.suspended
		if(isSuspended){
			res.render('buyer/suspended')
		}
		else{
			var otp = await Math.floor(Math.random()*1000000)
			var otpstr = await otp.toString()
			var hashed = await bcrypt.hash(otpstr, 12);
			Buyer.updateOne({ email }, { $set: { otp: hashed }}, function(err, buyer){
				if(err){
				   console.log(err);
				}
			})
			
			// send mail with defined transport object
			var mailOptions={
				to: req.body.email,
				subject: "Login OTP for ShopHop: ",
				html: "<h3>OTP for login is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
				};

				transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
				   return console.log(error);
				}
			});
			req.session.credentials = true
			req.session.email = email  
			res.redirect('/otp')
		}		
	}
	else {
		alert("Wrong email or password!")
		res.redirect('/login')
	}
})

router.get('/otp', (req, res) => {
	if(!req.session.credentials){
		return res.redirect('/login')
	}
	res.render('buyerotp')
})

router.post('/otp', async(req, res) => {
	var buyer = await Buyer.findOne({ email: req.session.email });
	var email = buyer.email
	var otp = req.body.otp
	var isValid = await Buyer.validateOTP(email, otp)
	if(isValid){
		req.session.buyer_id = buyer._id
		alert("Login successful!")
		res.redirect('/buyer/home')
	}
	else {
		alert("Wrong OTP entered!")
		res.redirect('/login')
	}
})

router.get('/sellersignup', (req, res) => {
	res.render('sellersignup')
})

router.post('/sellersignup', upload.single('doc'), async(req, res) => {
	var document = req.file.filename
	const { username, email, password, phone, city } = req.body;
	var isApproved = false
	const seller = new Seller({ username, email, password, phone, city, document, isApproved })
	await seller.save();
	res.redirect('/sellerlogin')
})

router.get('/sellerlogin', (req, res) => {
	res.render('sellerlogin')
	req.session.destroy()
})

router.post('/sellerlogin', async(req, res) => {
	const { email, password } = req.body;
	var sellerExist = await Seller.findOne({ email });
	var isValid = false
	if(sellerExist){
		isValid = await Seller.validateSeller(email, password)
	}
	if(sellerExist && isValid){
		const isSuspended = sellerExist.suspended
		const isApproved = sellerExist.isApproved
		if(isSuspended){
			res.render('seller/suspended')
		}
		if(!isApproved){
			res.render('seller/notapproved')
		}
		else{
			var otp = await Math.floor(Math.random()*1000000)
			var otpstr = await otp.toString()
			var hashed = await bcrypt.hash(otpstr, 12);
			Seller.updateOne({ email }, { $set: { otp: hashed }}, function(err, buyer){
				if(err){
				   alert("Seller not found");
				}
			})
			
			// send mail with defined transport object
			var mailOptions={
				to: email,
				subject: "Login OTP for ShopHop: ",
				html: "<h3>OTP for login is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
				};

				transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
				   return console.log(error);
				}
			});
			req.session.credentials = true
			req.session.email = email  
			res.redirect('/sellerotp')
		}		
	}
	else {
		alert("Wrong email or password!")
		res.redirect('/sellerlogin')
	}
})

router.get('/sellerotp', (req, res) => {
	if(!req.session.credentials){
		return res.redirect('/sellerlogin')
	}
	res.render('sellerotp')
})

router.post('/sellerotp', async(req, res) => {
	var seller = await Seller.findOne({ email: req.session.email });
	var email = seller.email
	var otp = req.body.otp
	var isValid = await Seller.validateOTP(email, otp)
	if(isValid){
		req.session.seller_id = seller._id
		alert("Login successful!")
		res.redirect('/seller/home')
	}
	else {
		alert("Wrong OTP entered!")
		res.redirect('/sellerlogin')
	}
})

router.get('/admin', async (req, res) => {
	res.render('adminlogin')
	req.session.destroy()
})

router.post('/adminlogin', async(req, res) => {
	const { secname, password } = req.body;
	const isName = await bcrypt.compare(secname, process.env.ADMINNAME);
	const isPass = await bcrypt.compare(password, process.env.ADMINPASS); 
	if(isName && isPass){
		req.session.admin_id = "12345678987654321"
		res.redirect('/admin/home')
	}
	else {
		res.redirect('/admin')
	}
})

router.post('/logout', (req, res) => {
	if(req.session) {
		req.session.auth = null
		req.session.destroy()
	}
	res.redirect('/')
})

module.exports = router;
