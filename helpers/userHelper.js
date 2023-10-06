const User = require('../model/userModel');
const Product = require('../model/productModel');
const Orders = require('../model/ordersModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
let instance = new Razorpay
    ({
        key_id: 'rzp_test_fWH63GUDMTI221',
        key_secret: 'k0tmdvbtpmf11fcrrV5ay7dI'
    })

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: maxAge
    });
};

const verifyLogin = (data) => {

    return new Promise((resolve, reject) => {
        User.findOne({ email: data.email })
            .then((userData) => {
                if (userData) {
                    bcrypt.compare(data.password, userData.password)
                        .then((passwordMatch) => {
                            console.log(passwordMatch)
                            if (passwordMatch) {
                                if (userData.isActive == false) {
                                    resolve({ error: "Your Acount is Blocked" })
                                } else {
                                    const token = createToken(userData._id);

                                    resolve({ token })
                                }
                            } else {
                                console.log('password mismatch');
                                resolve({ error: "Invalid Email Password" });
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    resolve({ error: "Invalid Email a Password" });
                }
            })
            .catch((error) => {
                reject(error);
            });
    })
}

const generateRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {

        console.log(total * 100);
        let options = {
            amount: total * 100,
            currency: 'INR',
            receipt: orderId
        };

        instance.orders.create(options, function (err, order) {
            console.log('New Order', order);
            if (err) {
                console.log(err)
            } else {
                resolve(order)
            }

        })

    })
}

const verifyPayment = (details) => {
    console.log(details)
    return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'k0tmdvbtpmf11fcrrV5ay7dI')

        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')

        if (hmac == details.payment.razorpay_signature) {
            console.log("success");
            resolve();
        } else {
            console.log("Failed");
            reject();
        }

    })
}

const changePaymentStatus = (orderId) => {
    return new Promise((resolve, reject) => {
        console.log(orderId);
        Orders.updateOne({ _id: orderId },
            {
                $set: {
                    orderStatus: "Accepted",
                    paymentStatus: "Paid"
                }
            }).then(() => {
                console.log("changed");
                resolve();
            })
    })
}

module.exports = {
    verifyLogin,
    generateRazorpay,
    verifyPayment,
    changePaymentStatus
}