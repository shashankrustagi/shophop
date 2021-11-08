const express = require('express');
const router  = express.Router();
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
			req.session.buyer_id = buyerExist._id
			alert('Login successful!');
			res.redirect('/buyer/home')
		}		
	}
	else {
		alert("Wrong email or password!")
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
			req.session.seller_id = sellerExist._id
			alert('Login successful!');
			res.redirect('/seller/home')
		}		
	}
	else {
		alert("Wrong email or password!")
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
