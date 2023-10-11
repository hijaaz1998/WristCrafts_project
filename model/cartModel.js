const mongoose = require('mongoose');
const Product = require('./productModel');


const cartModel = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    quantity: {
        type: Number,
        required: true
    },
    

});

module.exports = mongoose.model('Cart', cartModel);