const User = require('../model/userModel');
let otp = 0;
const nodemailer = require('nodemailer');
const Product = require('../model/productModel');
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/userHelper');
const Category = require('../model/categoryModel');
const Banner = require('../model/bannerModel')
const Order = require('../model/ordersModel');

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: maxAge
    });
};

const loadError = async(req, res) => {

    try {

        res.render('error-404')
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadRegister = async (req, res) => {

    if (res.locals.user != null) {
        res.redirect('/')
    } else {
        res.render('registration', { message: '', errMessage: '' });
    }
}

const loadHome = async (req, res) => {

    try {

        const banner = await Banner.findOne({ isActive: true });
        const products = await Product.find({ isDeleted: false }).limit(8);
        const category = await Category.find({ IsDeleted: false })
        res.render('index', { user: res.locals.user, banner: banner, products: products, category: category });


    } catch (error) {
        console.log(error.message);
    }
}

const loadHome1 = async (req, res) => {

    try {

        const banner = await Banner.find({ isActive: true });

        res.render('index', { user: res.locals.user, banner: banner });

    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async (req, res) => {

    try {
        if (res.locals.user != null) {
            res.redirect('/')
        } else {
            res.render('login', { message: '', errMessage: '' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const   sendOtp = async (req, res) => {

    try {

        const email = req.body.email;
        const checkData = await User.findOne({ email: email });

        if (checkData) {
            res.render('registration', { message: '', errMessage: 'Email Already Exists!!!' });
        } else {

            req.session.temp = new User({
                fname: req.body.fname,
                lname: req.body.lname,
                mobile: req.body.mobile,
                email: req.body.email,
                password: req.body.password
            });

        }

        otp = generateOtp();
        console.log(otp);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.user,
                pass: process.env.pass
            }
        });

        const mailOptions = {
            from: 'test@wristcrafts.com',
            to: req.session.temp.email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.redirect('/register');
            } else {
                res.redirect('/verify');
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

const otpVerify = async (req, res) => {

    try {

        res.render('verify');

    } catch (error) {
        console.log(error.message);
    }
}

const verified = async (req, res) => {

    try {


        if (req.body.otp === String(otp)) {

            const securePword = await securePassword(req.session.temp.password);

            const details = new User({
                fname: req.session.temp.fname,
                lname: req.session.temp.lname,
                mobile: req.session.temp.mobile,
                email: req.session.temp.email,
                password: securePword
            });

            const userData = await details.save();

            if (userData) {
                req.session.temp = null;
                res.redirect('/login');
            }

        } else {
            console.log("error")
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    const data = req.body;

    const result = await userHelper.verifyLogin(data);

    if (result.error) {

        res.render('login', { message: '', errMessage: result.error });

    } else {

        const token = result.token;
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect('/')
    }
}

const verifyUser = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {

            if (userData.isActive) {
                const verifiedPassword = await bcrypt.compare(password, userData.password)
                if (verifiedPassword) {
                    req.session.user_id = userData._id;
                    res.render('index', { user: userData });
                } else {
                    res.render('login', { message: '', errMessage: 'Invalid Email or Password' })
                }
            } else {
                res.render('login', { message: '', errMessage: 'User have been blocked!!!' });
            }

        } else {
            res.render('login', { message: '', errMessage: 'Invalid Email or Password' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {

    try {
        res.cookie('jwt', '', { maxAge: 1 })
        res.redirect('/');

    } catch (error) {
        console.log(error.message)
    }
}

const loadShop = async (req, res) => {

    try {

        const categoryId = req.query.categoryId;
        const page = req.query.page || 1;
        const itemsPerPage = 6;
        const skip = (page - 1) * itemsPerPage;
        const sort = req.query.sort;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        const categories = await Category.find({IsDeleted: false});

        const filter = {
            isDeleted: false,
            Category: { $in: categories.map(cat => cat._id) }
        };
        
        if (categoryId) {
            filter.Category = categoryId;
        }

        if (minPrice && maxPrice) {
            filter.salePrice = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice) {
            filter.salePrice = { $gte: minPrice };
        } else if (maxPrice) {
            filter.salePrice = { $lte: maxPrice };
        }

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        let products;

        if (sort === '1') {
            products = await Product.find(filter)
                .sort({ salePrice: 1 })
                .skip(skip)
                .limit(itemsPerPage)
                .exec();
        } else if (sort === '-1') {
            products = await Product.find(filter)
                .sort({ salePrice: -1 })
                .skip(skip)
                .limit(itemsPerPage)
                .exec();
        } else {
            products = await Product.find(filter)
                .skip(skip)
                .limit(itemsPerPage)
                .exec();
        }

        

        res.render('shop', {
            user: res.locals.user, Product: products,
            category: categories, totalPages: totalPages,
            currentPage: page, categoryId: categoryId || '',
            page: req.query.page || 1, sort: sort || '',
            minPrice: minPrice || '', maxPrice: maxPrice || ''
        });

    } catch (error) {
        console.log(error.message);
    }
}

const loadProductDeatils = async (req, res) => {

    try {

        const userId = res.locals.user._id;

        const userOrderedProduct = await Order.findOne({
            user: userId,
            'products.product': req.query.id,
            orderStatus: 'Delivered',
            
        });
        

        const reviews = await Product.findById(req.query.id)
            .select({ reviews: { $slice: 3 } }) 
            .populate('reviews.user', 'fname')
            .sort({ 'reviews.createdOn': -1 });


        const userReviews = await Product.findById(req.query.id)
            .select('reviews.userRating reviews.userReviews')
            .populate('reviews.user', 'fname')
            .sort({ 'reviews.createdOn': -1 })
            .limit(3);


        const Data = await Product.findById(req.query.id);
        res.render('productDeatils', { Product: Data, user: res.locals.user, review: reviews.reviews, userReviews: userReviews, userOrderedProduct: userOrderedProduct });

    } catch (error) {
        console.log(error.message);
    }
}



const securePassword = async (password) => {

    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;

    } catch (error) {

        console.log(error.message);

    }

}

const forgotPassword = async (req, res) => {

    try {

        res.render('forgotPassword')

    } catch (error) {
        console.log(error.message)
    }
}

const forgotOtp = async (req, res) => {

    try {

        const email = req.body.email;
        const checkData = await User.findOne({ email: email });

        if (!checkData) {
            res.render('forgotPassword', { message: '', errMessage: 'Enter a valid Email Address' });
        } else {
            res.redirect('/forgotVerify');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgotOtpVerify = async (req, res) => {

    try {

        otp = generateOtp();
        const email = req.body.email;

        const checkData = await User.findOne({ email: email });

        if (!checkData) {
            res.render('forgotPassword', { message: '', errMessage: 'Enter a valid Email Address' });
        } else {

            console.log(otp);

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: 'muhammadijasbtc@gmail.com',
                    pass: 'garptzwtnjktkggr'
                }
            });

            const mailOptions = {
                from: 'test@wristcrafts.com',
                to: req.body.email,
                subject: 'Your OTP',
                text: `Your OTP is: ${otp}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.redirect('/login');
                } else {
                    console.log('Email sent:');
                    req.session.email = email;
                    req.session.otp = otp;
                    res.redirect(`/forgotVerify`);
                }
            });
        }



    } catch (error) {
        console.log(error.message);
    }
}

const loadForgotOtpVerify = async (req, res) => {
    try {

        // const email = req.query.email;
        // const otp = req.query.otp;

        // req.session.email = email;
        // req.session.otp = otp;

        res.render('forgotVerify');

    } catch (error) {
        console.log(error.message);
    }
}

const forgotPasswordVerify = async (req, res) => {

    try {
        console.log(req.session.email);
        console.log(req.session.otp);
        console.log(req.body.otp);
        const email = req.session.email;
        const otp = parseInt(req.body.otp);
        const vOtp = req.session.otp
        console.log(typeof otp);
        console.log(typeof vOtp);

        if (otp===vOtp) {

            const securePword = await securePassword(req.body.password);

            const user = await User.findOneAndUpdate({ email: email },
                {
                    $set: {
                        password: securePword
                    }
                })

                console.log(user);

            const userData = await user.save();
            console.log(user);
            console.log(userData);

            if (userData) {

                res.redirect('/login');
            }

        } else {
            res.render('forgotVerify', { errMessage: "OTP Dosent Match" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const searchProducts = async (req, res) => {
    try {

        const searchQuery = req.query.q;

        const searchResults = await Product.find({
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { brandName: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        const category = await Category.find();


        res.render('searchResults', { Product: searchResults, category: category })


    } catch (error) {

    }
}

function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}


module.exports = {
    loadRegister,
    loadHome,
    loadLogin,
    sendOtp,
    otpVerify,
    verified,
    verifyUser,
    logout,
    loadHome1,
    loadShop,
    loadProductDeatils,
    verifyLogin,
    forgotPassword,
    forgotOtp,
    loadForgotOtpVerify,
    forgotPasswordVerify,
    forgotOtpVerify,
    searchProducts,
    loadError

}
