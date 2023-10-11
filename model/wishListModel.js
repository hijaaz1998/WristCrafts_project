const mongoose = require('mongoose')
const WishListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }
  ],
});

module.exports = mongoose.model('WishList', WishListSchema)