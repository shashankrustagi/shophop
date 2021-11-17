const express = require('express');
const bodyparser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const app = express();
const alert = require('alert');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');
const ExpressError = require('./utils/ExpressError');

require('dotenv').config()

const host = 'localhost'
const port = process.env.PORT || 3000

const fs = require('fs');
const key = fs.readFileSync('./CA/localhost/localhost.decrypted.key');
const cert = fs.readFileSync('./CA/localhost/localhost.crt');
const https = require('https');
const server = https.createServer({ key, cert }, app);

const dburl = 'mongodb://localhost:27017/' + process.env.DB
mongoose.connect(dburl, { useNewUrlParser: true })
	.then(()=>{
		console.log("Connected to database")
	})
	.catch((err)=>{
		alert("Error in connecting to database")
	})

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(session({
  secret: 'thisisagoodandbadsecret',
  saveUninitialized: false, 
  resave: false, 
  store: MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 3600 // time period in seconds
  })
}));

app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy: false}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended:true }))

// Models
const Buyer = require('./models/buyer')
const Seller = require('./models/seller')
const Product = require('./models/product')

// Routes
const mainRoutes = require("./routes/main")
const buyerRoutes = require("./routes/buyer")
const sellerRoutes = require("./routes/seller")
const adminRoutes = require("./routes/admin")

app.use("/", mainRoutes);
app.use("/buyer", buyerRoutes);
app.use("/seller", sellerRoutes);
app.use("/admin", adminRoutes);

app.use((err, req, res, next) =>{
	res.status(404).send("Something went wrong!")
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).send( err )
})

server.listen(port, host, () => {
	console.log(`Server running on Port ${port}`)
})
