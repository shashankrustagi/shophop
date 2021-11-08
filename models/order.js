const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	item_name: String,
	item_image: String,
	buyer_id: mongoose.Schema.Types.ObjectId,
	seller_id: mongoose.Schema.Types.ObjectId,
	order_price: Number,
	status: String,
	order_date: {
		type: Date,
		default: new Date()
	},
	delivery_date: {
		type: Date,
		default: new Date(+new Date() + 10*24*60*60*1000)
	},
	stripe_custid: String
})

module.exports = mongoose.model('Order', orderSchema);
