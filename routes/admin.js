const express = require('express');
const router  = express.Router();
const path = require('path');
const ObjectId = require('mongodb').ObjectId;
const alert = require('alert')

const Buyer = require('../models/buyer')
const Seller = require('../models/seller')
const Product = require('../models/product')
const Order = require('../models/order')
const Admin = require('../models/admin')

const adminLogin = (req, res, next) => {
	if(!req.session.admin_id){
		alert('You dont have access to this route')
		return res.redirect('/adminlogin')
	}
	next();
}

const superadminLogin = (req, res, next) => {
	if(!req.session.superadmin_id){
		alert('You dont have access to this route')
		return res.redirect('/adminlogin')
	}
	next();
}

router.get('/home', adminLogin, async(req, res) => {
	res.render('admin/home')
})

router.get('/supadminhome', adminLogin, async(req, res) => {
	res.render('admin/supadminhome')
})

router.get('/buyers', adminLogin, async(req, res) => {
	Buyer.find({}, function(err, buyers){
        if(err){
           console.log(err);
        } else 
           res.render('admin/buyers', { buyers })
        })
})

router.get('/vieworders/:id', adminLogin, (req, res) => {
	Order.find({ buyer_id: req.params.id }, function(err, orders){
		if(err){
			console.log(err)
		}
		else{
			console.log(orders)
			res.render('admin/buyerorders', { orders })
		}
        })
})

router.post('/suspendbuyer/:id', adminLogin, (req, res) => {
	Buyer.updateOne({ _id: req.params.id }, { $set: { suspended: true }}, function(err, buyer){
	if(err){
           console.log(err);
        } else 
           res.redirect('/admin/buyers')
	})
})

router.post('/unsuspendbuyer/:id', adminLogin, (req, res) => {
	Buyer.updateOne({ _id: req.params.id }, { $set: { suspended: false }}, function(err, buyer){
	if(err){
           console.log(err);
        } else 
           res.redirect('/admin/buyers')
	})
})

router.post('/removebuyer/:id', adminLogin, (req, res) => {
	Order.delete({ buyer_id: req.params.id }, function(err, order){
		if(err){
		   console.log(err);
		}
	})
	Buyer.deleteOne({ _id: req.params.id }, function(err, buyer){
		if(err){
		   console.log(err);
		} else 
		   res.redirect('/admin/buyers')
	})
})

router.get('/sellers', adminLogin, async(req, res) => {
	Seller.find({ isApproved: true }, function(err, sellers){
        if(err){
           console.log(err);
        } else 
           res.render('admin/sellers', { sellers })
        })
})

router.get('/requests', adminLogin, async(req, res) => {
	Seller.find({ isApproved: false}, function(err, requests){
        if(err){
           console.log(err);
        } else 
           res.render('admin/requests', { requests })
        })
})

router.post('/approveseller/:id', adminLogin, (req, res) => {
	Seller.updateOne({ _id: req.params.id }, { $set: {isApproved: true }}, function(err, buyer){
	if(err){
           console.log(err);
        } else 
           res.redirect('/admin/requests')
	})
})

router.post('/suspendseller/:id', adminLogin, (req, res) => {
	Seller.updateOne({ _id: req.params.id }, { $set: {suspended: true }}, function(err, buyer){
	if(err){
           console.log(err);
        } else 
           res.redirect('/admin/sellers')
	})
})

router.post('/unsuspendseller/:id', adminLogin, (req, res) => {
	Seller.updateOne({ _id: req.params.id }, { $set: {suspended: false}}, function(err, buyer){
	if(err){
           console.log(err);
        } else 
           res.redirect('/admin/sellers')
	})
})

router.post('/removeseller/:id', adminLogin, (req, res) => {
	Product.update({ "soldby.id": req.params.id}, { $set: { listed: false }}, function(err, product){
		if(err){
		   console.log(err);
		}
        })
	Seller.deleteOne({ _id: req.params.id }, function(err, buyer){
	if(err){
           console.log(err);
        } else 
           res.redirect('/admin/sellers')
	})
})

router.get('/viewdoc/:id', adminLogin, (req, res) => {
	Seller.findOne({ _id: req.params.id }, function(err, seller){
		if(err){
			console.log(err)
		}
		else{
			res.render('admin/viewdoc', { docName : seller.document})
		}
        })
})

router.get('/admins', superadminLogin, async(req, res) => {
	Admin.find({ isApproved: true }, function(err, admins){
        if(err){
           console.log(err);
        } else 
           res.render('admin/admins', { admins })
        })
})

router.get('/adminrequests', superadminLogin, async(req, res) => {
	Admin.find({ isApproved: false }, function(err, admins){
        if(err){
           console.log(err);
        } else 
           res.render('admin/adminrequests', { admins })
        })
})

router.post('/approveadmin/:id', superadminLogin, (req, res) => {
	Admin.updateOne({ _id: req.params.id }, { $set: {isApproved: true }}, function(err, admin){
	if(err){
           console.log(err);
        } else {
           alert('Admin approved!')
           res.redirect('/admin/adminrequests')
        }
	})
})

router.post('/removeadmin/:id', superadminLogin, (req, res) => {
	Admin.deleteOne({ _id: req.params.id }, function(err, admin){
	if(err){
           console.log(err);
        } else {
           alert('Admin removed!')
           res.redirect('/admin/admins')
        }
	})
})

router.post('/logout', (req, res) => {
	if(req.session) {
		req.session.auth = null
		req.session.destroy()
	}
	res.redirect('/')
})

module.exports = router;
