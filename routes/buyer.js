const express = require('express');
const router  = express.Router();
require('dotenv').config()

const Buyer = require('../models/buyer')
const Product = require('../models/product')
const Order = require('../models/order')

var Publishable_Key = process.env.STR_PUB
var Secret_Key = process.env.STR_SEC

const stripe = require('stripe')(Secret_Key)

const buyerLogin = (req, res, next) => {
	if(!req.session.buyer_id){
		return res.redirect('/login')
	}
	next();
}

router.get('/home', buyerLogin, async(req, res) => {
	const buyer_id = req.session.buyer_id
	const buyer = await Buyer.findOne({ _id: buyer_id })
	const username = buyer.username
	Product.find({}, function(err, allProducts){
        if(err){
           console.log(err);
        } else 
           res.render('buyer/home', { username , products: allProducts})
        })
})

router.get('/cart', buyerLogin, (req, res) => {
	Buyer.findOne({ _id: req.session.buyer_id }, function(err, buyer){
		if(err){
		  console.log(err);
		} else {
		   Product.find({ _id: buyer.cart_items }, async function(err, items){
		   if(err){
			console.log(err);
		    } else {
			let sum = 0
			await items.forEach( function(item){
				sum += item.price
			})
			let buyer = await Buyer.findOneAndUpdate({ _id: req.session.buyer_id }, { $set: { cart_val: sum }}, {
			  new: true
			}).then(buyer=>{
				res.render('buyer/cart', { buyer, items, sum })
			})
		     }
		   })
		}
        })
})

router.post('/view/:id', buyerLogin, (req, res) => {
	Product.findOne({ _id: req.params.id }, function(err, product){
        if(err){
           console.log(err);
        } else {
           res.render('buyer/product', {product})
        }
        })
})

router.post('/addtocart/:id', buyerLogin, (req, res) => {
	Buyer.updateOne({ _id: req.session.buyer_id }, { $push: {cart_items: req.params.id }}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/buyer/home')
        }
        })
})

router.post('/deletefromcart/:id', buyerLogin, (req, res) => {
	Buyer.updateOne({ _id: req.session.buyer_id }, { $pull: {cart_items: req.params.id }}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/buyer/cart')
        }
        })
})

router.get('/checkout', buyerLogin, (req, res) => {
	Buyer.findOne({ _id: req.session.buyer_id }, function(err, buyer){
		if(err){
		  console.log(err);
		} else {
			res.render('buyer/payment' , { username: buyer.username, amt: buyer.cart_val, key: Publishable_Key })
		}
	})
})

router.post('/checkout', function(req, res){
	Buyer.findOne({ _id: req.session.buyer_id }, function(err, buyer){
		if(err){
		  console.log(err);
		} else {
			stripe.customers.create({
			email: req.body.stripeEmail,
			source: req.body.stripeToken,
			name: buyer.username,
			address: {
				delname: req.body.delname,
				line1: req.body.line1,
				line2: req.body.line2,
				postal_code: req.body.pin,
				city: req.body.city,
				state: req.body.state,
				country: 'India',
			}
			})
			.then((customer) => {
				return stripe.charges.create({
					amount: buyer.cart_val*100,
					description: 'Shopping on Shophop by ' + buyer.username,
					currency: 'INR',
					customer: customer.id
				});
			})
			.then(async (charge) => {
				await buyer.cart_items.forEach(function(item){
					Product.findOne({ _id: item }, async function(err, prod){
						if(err) {
							console.log(err)}
						else {
							const order = new Order({
								item_name: prod.title,
								item_image: prod.images[0],
								buyer_id: buyer._id,
								seller_id: prod.soldby.id,
								order_price: prod.price,
								status: "Ordered",
								order_date: new Date(),
								delivery_date: new Date(+new Date() + 7*24*60*60*1000),
								stripe_custid: charge.customer.id,
								delivery_add: charge.customer.address
							})
							await order.save()
						}
					})
				})
				await Buyer.updateOne({ _id: buyer._id }, {$unset: {cart_items: 1}, $set: { cart_val: 0 }})
				alert("Order Placed Successfully!")
				res.redirect('home')
			})
			.catch((err) => {
				res.send(err)
			});
		}
	})
})

router.get('/order', buyerLogin, (req, res) => {
	Order.find({ buyer_id: req.session.buyer_id }, function(err, orders){
		if(err){
			console.log(err)
		}
		else{
			res.render('buyer/order', { orders })
		}
        })
})

router.post('/cancelorder/:id', buyerLogin, (req, res) => {
	Order.deleteOne({ _id: req.params.id }, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/buyer/order')
        }
        })
})

router.post('/logout', (req, res) => {
	if(req.session) {
		req.session.auth = null
		req.session.destroy()
	}
	res.redirect('/login')
})

module.exports = router;
