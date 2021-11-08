const express = require('express');
const router  = express.Router();
const path = require('path');
const multer = require('multer');
const ObjectId = require('mongodb').ObjectId;

const Seller = require('../models/seller')
const Product = require('../models/product')
const Order = require('../models/order')

const sellerLogin = (req, res, next) => {
	if(!req.session.seller_id){
		return res.redirect('/sellerlogin')
	}
	next();
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const imagePath = path.join(__dirname, '../public/images');
        cb(null, imagePath);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage })

router.get('/home', sellerLogin, async(req, res) => {
	const seller_id = req.session.seller_id
	const seller = await Seller.findOne({ _id: seller_id })
	const username = seller.username
	var s_id = await ObjectId(seller_id)
	Product.find({ "soldby.id": s_id, listed: true }, function(err, sellerProducts){
        if(err){
           console.log(err);
        } else {
           res.render('seller/home', { username , products: sellerProducts})
	}
        })
})

router.get('/listitem', sellerLogin, (req, res) => {
	res.render('seller/listitem')
})

router.post('/listitem', sellerLogin, upload.array('product'), (req, res) => {
	var arr = []
	req.files.forEach(function(file){
		arr.push(file.filename)
	})
	console.log(arr)
	Seller.findOne({ _id: req.session.seller_id}, (err, seller)=>{
		if(err) {
			console.log(err)
		}
		else{
			const seller_id = seller._id;
			const seller_name = seller.username;
			const {title, description, price, quantity, category } = req.body;
			const product = new Product({ title, description, price, quantity, category,
					soldby: { id: seller_id, username: seller_name },
					images: arr, listed: true}
			)
			product.save()
			console.log(product)
			res.redirect('home')
		}
	})
})

router.post('/changeprice/:id', sellerLogin, (req, res) => {
	Product.updateOne({ _id: req.params.id }, { $set: { price: req.body.newprice}}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/seller/home')
        }
        })
})

router.post('/changeqty/:id', sellerLogin, (req, res) => {
	Product.updateOne({ _id: req.params.id }, { $set: { quantity: req.body.newqty}}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/seller/home')
        }
        })
})

router.post('/unlistitem/:id', sellerLogin, (req, res) => {
	Product.updateOne({ _id: req.params.id }, { $set: { listed: false }}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/seller/home')
        }
        })
})

router.get('/order', sellerLogin, (req, res) => {
	Order.find({ seller_id: req.session.seller_id }, function(err, orders){
		if(err){
			console.log(err)
		}
		else{
			console.log(orders)
			res.render('seller/order', { orders })
		}
        })
})

router.post('/updateorder/:id', sellerLogin, (req, res) => {
	console.log(req.params.status)
	Order.updateOne({ _id: req.params.id }, { $set: { status: req.body.status }}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/seller/order')
        }
        })
})

router.post('/logout', (req, res) => {
	if(req.session) {
		req.session.auth = null
		req.session.destroy()
	}
	res.redirect('/sellerlogin')
})

module.exports = router;
