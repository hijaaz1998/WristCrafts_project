const User = require('../model/userModel');
const cookieParser = require("cookie-parser");
const express = require('express')

const app = express();
app.use(cookieParser());
const isLogin = async (req, res, next) => {

    try {

        if (req.session.user_id) {
            const user = await User.findById(req.session.user_id);

            if (user.isActive) {
                next();
            } else {
                req.session.user_id = null;
                res.redirect('/login');
            }

        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {

    try {

        if (req.session.user_id) {
            res.redirect('/');
        } else {
            next();
        }

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    isLogin,
    isLogout
}