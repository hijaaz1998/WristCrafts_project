const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const bodyParser = require('body-parser');
const logger = require('morgan');
const noCache = require('nocache');

const mongoose = require('./config/dbConnect');



mongoose.connect();

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use(session({
    secret : config.secredId,
    resave : false,
    saveUninitialized : true
}));

app.use(express.json());
app.use(noCache());
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(cookieParser());
app.use(express.static('public'));

app.use('/', userRoute);
app.use('/admin', adminRoute);

app.set('view engine', 'ejs');



app.listen(1000, () => {
    console.log('server started');
})