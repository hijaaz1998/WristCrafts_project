const mongoose = require('mongoose');

const categoryModel = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    IsDeleted: {
        type: Boolean,
        default : false
    }

})

module.exports = mongoose.model('Category', categoryModel);