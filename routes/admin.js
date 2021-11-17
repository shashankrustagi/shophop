const express = require('express');
const router  = express.Router();
const path = require('path');
const ObjectId = require('mongodb').ObjectId;
const alert = require('alert')
const funcAsync = require('../utils/funcAsync');

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

router.get('/home', adminLogin, (req, res) => {
	res.render('admin/home')
})

router.get('/supadminhome', adminLogin, (req, res) => {
	res.render('admin/supadminhome')
})

router.get('/buyers', adminLogin, (req, res) => {
	Buyer.find({}, function(err, buyers){
        if(err){
           alert(err);
           next();
        } else 
           res.render('admin/buyers', { buyers })
        })
})

router.get('/vieworders/:id', adminLogin, (req, res) => {
	Order.find({ buyer_id: req.params.id }, function(err, orders){
		if(err){
		   alert(err);
		   next();
		}
		else{
			res.render('admin/buyerorders', { orders })
		}
        })
})

router.post('/suspendbuyer/:id', adminLogin, (req, res) => {
	Buyer.updateOne({ _id: req.params.id }, { $set: { suspended: true }}, function(err, buyer){
	if(err){
           alert(err);
           next();
        } else 
           res.redirect('/admin/buyers')
	})
})

router.post('/unsuspendbuyer/:id', adminLogin, (req, res) => {
	Buyer.updateOne({ _id: req.params.id }, { $set: { suspended: false }}, function(err, buyer){
	if(err){
            alert(err);
           next();
        } else 
           res.redirect('/admin/buyers')
	})
})

router.post('/removebuyer/:id', adminLogin, (req, res) => {
	Buyer.deleteOne({ _id: req.params.id }, function(err, buyer){
		if(err){
		   alert(err);
		   console.log("error removing buyer")
		   next();
		} else 
		   res.redirect('/admin/buyers')
	})
})

router.get('/sellers', adminLogin, (req, res) => {
	Seller.find({ isApproved: true }, function(err, sellers){
        if(err){
           alert(err);
           next();
        } else 
           res.render('admin/sellers', { sellers })
        })
})

router.get('/requests', adminLogin, (req, res) => {
	Seller.find({ isApproved: false}, function(err, requests){
        if(err){
           alert(err);
           next();
        } else 
           res.render('admin/requests', { requests })
        })
})

router.post('/approveseller/:id', adminLogin, (req, res) => {
	Seller.updateOne({ _id: req.params.id }, { $set: {isApproved: true }}, function(err, buyer){
	if(err){
           alert(err);
           next();
        } else 
           res.redirect('/admin/requests')
	})
})

router.post('/suspendseller/:id', adminLogin, (req, res) => {
	Seller.updateOne({ _id: req.params.id }, { $set: {suspended: true }}, function(err, buyer){
	if(err){
           alert(err);
           next();
        } else 
           res.redirect('/admin/sellers')
	})
})

router.post('/unsuspendseller/:id', adminLogin, (req, res) => {
	Seller.updateOne({ _id: req.params.id }, { $set: {suspended: false}}, function(err, buyer){
	if(err){
           alert(err);
           next();
        } else 
           res.redirect('/admin/sellers')
	})
})

router.post('/removeseller/:id', adminLogin, (req, res) => {
	Product.update({ "soldby.id": req.params.id}, { $set: { listed: false }}, function(err, product){
		if(err){
		   alert(err);
		   next();
		}
        })
	Seller.deleteOne({ _id: req.params.id }, function(err, buyer){
	if(err){
            alert(err);
            next();
        } else 
           res.redirect('/admin/sellers')
	})
})

router.get('/viewdoc/:id', adminLogin, (req, res) => {
	Seller.findOne({ _id: req.params.id }, function(err, seller){
		if(err){
		   alert(err);
		   next();
		}
		else{
			res.render('admin/viewdoc', { docName : seller.document})
		}
        })
})

router.get('/admins', superadminLogin, (req, res) => {
	Admin.find({ isApproved: true }, function(err, admins){
        if(err){
           alert(err);
           next();
        } else 
           res.render('admin/admins', { admins })
        })
})

router.get('/adminrequests', superadminLogin, (req, res) => {
	Admin.find({ isApproved: false }, function(err, admins){
        if(err){
           alert(err);
           next();
        } else 
           res.render('admin/adminrequests', { admins })
        })
})

router.post('/approveadmin/:id', superadminLogin, (req, res) => {
	Admin.updateOne({ _id: req.params.id }, { $set: {isApproved: true }}, function(err, admin){
	if(err){
           alert(err);
           next();
        } else {
           alert('Admin approved!')
           res.redirect('/admin/adminrequests')
        }
	})
})

router.post('/removeadmin/:id', superadminLogin, (req, res) => {
	Admin.deleteOne({ _id: req.params.id }, function(err, admin){
	if(err){
           alert(err);
           next();
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
