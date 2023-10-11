const mongoose = require('mongoose');

const userModel = new mongoose.Schema({

    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    cart: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    Address: [{
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        isPrimary: {
            type: Boolean,
            default: false
        }

    }],
    walletBalance: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: {
            type: String
        },
        amount: {
            type: Number,
        },
        date: {
            type: Date
        }
    }],
    usedCoupons: {
        type: Array
    }

});

module.exports = mongoose.model('Users', userModel);