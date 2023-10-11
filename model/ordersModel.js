const mongoose = require('mongoose');

const OrderModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    products: [{    
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },      
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    address:{
        type: String,
        required: true
    },

    createdOn: {
        type: Date,
        required: true
    }, 
    paymentMethod:{
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    returnStatus: {
        type: String
    }
});

module.exports = mongoose.model('Orders', OrderModel);