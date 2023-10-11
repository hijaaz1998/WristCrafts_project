const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },   
    description: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    isActive:{
        type: Boolean,
        default: false
    }
    
})

module.exports = mongoose.model('Banner',bannerSchema)