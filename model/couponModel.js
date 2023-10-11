const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

    code: {
        type: String
    },
    discountPercentage:{
        type: Number,
        required: true
    },
    name: {
        type: String
    },
    validity: {
        type: Date
    },
    minPurchase: {
        type: Number
    },
    maxDiscountValue: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ]
    
});

module.exports = mongoose.model('Coupon', couponSchema);