const User = require('../model/userModel');
const Product = require('../model/productModel');
const { default: mongoose } = require('mongoose');
const Orders = require('../model/ordersModel');
const Wishlist = require('../model/wishListModel');

const loadUserAccount = async (req, res) => {

    try {

        const user = await User.findById(res.locals.user._id);
        const address = user.Address.filter(val => val.isPrimary === true)
        if (address) {
            res.render('profile', { user: user, address: address });
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadOrders = async (req, res) => {

    try {

        const page = req.query.page || 1;
        const itemsPerPage = 10;
        const skip = (page - 1) * itemsPerPage;

        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / itemsPerPage)


        const userId = res.locals.user._id;

        const orders = await Orders.find({ user: userId }).sort({ createdOn: -1 }).skip(skip).limit(itemsPerPage);

        res.render('orders', { orders: orders, currentPage: page, totalPages: totalPages });

    } catch (error) {
        console.log(error.message)
    }
}



const loadAddress = async (req, res) => {

    try {

        const user = await User.findById(res.locals.user._id);
        const address = user.Address

        if (address) {
            res.render('address', { address: address });
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadNewAddress = async (req, res) => {

    try {

        res.render('addNewAddress')

    } catch (error) {
        console.log(error.message)
    }
}

const addNewAddress = async (req, res) => {

    try {

        const user = res.locals.user;
        const userId = user._id;

        let newAddress = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
        }

        const added = await User.findByIdAndUpdate(userId, {
            $push: { Address: newAddress }
        })

        if (added) {
            res.redirect('/address');
        }


    } catch (error) {
        console.log(error.message)
    }
}

const loadEditAddress = async (req, res) => {

    try {

        const addressId = req.query.addressId;
        const user = await User.findById(res.locals.user._id);
        const address = user.Address.find((addr) => addr._id.toString() === addressId);

        res.render('editAddress', { address: address });

    } catch (error) {
        console.log(error.message)
    }
}

const updateAddress = async (req, res) => {

    try {

        const id = req.body.addressId;

        const data = await User.updateOne({ 'Address._id': id },
            {
                $set: {
                    'Address.$.name': req.body.name,
                    'Address.$.email': req.body.email,
                    'Address.$.phone': req.body.phone,
                    'Address.$.address': req.body.address,
                    'Address.$.city': req.body.city,
                    'Address.$.state': req.body.state,
                    'Address.$.pincode': req.body.pincode
                }
            }
        );

        res.redirect('/address');


    } catch (error) {
        console.log(error.message)
    }
}

const setPrimaryAddress = async (req, res) => {

    try {

        const newPrimaryAddressId = req.body.defaultAddress;
        const user = res.locals.user;

        const newAddress = await user.Address.map(address => {
            // Set isPrimary as true if address._id matches newPrimaryAddressId, otherwise set it as false
            address.isPrimary = address._id === newPrimaryAddressId;
            return address;
        });

        // Update the user's Address array with the newAddress array
        user.Address = newAddress;

        // Save the updated user object with the new primary address
        await user.save();

        res.redirect('/address');

    } catch (error) {
        console.log(error.message)
    }
}

const loadWallet = async (req, res) => {
    try {
        const user = await User.findById(res.locals.user._id);

        user.transactions.sort((a, b) => b.date - a.date);

        const sortedTransaction = user.transactions;

        const transactionCount = sortedTransaction.length;

        const page = req.query.page || 1;
        const itemsPerPage = 10;
        const skip = (page - 1) * itemsPerPage;

        const totalPages = Math.ceil(transactionCount / itemsPerPage);

        const paginatedTransactions = sortedTransaction.slice(skip, skip + itemsPerPage);

        res.render('wallet', {
            walletBalance: user.walletBalance,
            transactions: paginatedTransactions,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.log(error.message);
    }
};


const reviewProduct = async (req, res) => {

    try {

        const user = res.locals.user;
        const userRating = req.body.userRating;
        const userReview = req.body.userReview;
        const productId = req.params.productId;

        const existingReview = await Product.findOne({ _id: productId, 'reviews.user': user._id });

        if (existingReview) {
            const responseData = {
                success: false,
                message: 'You have already submitted a review for this product',
            };
            return res.json(responseData);

        } else {
            const newReview = {
                user: user._id,
                userRating: userRating,
                userReviews: userReview,
                createdOn: new Date()
            };

            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { $push: { reviews: newReview } },
                { new: true }
            );

            if (!updatedProduct) {
                throw new Error('Product not found');
            }

            const reviews = await Product.findById(productId)
            .select({ reviews: { $slice: 3 } }) 
            .populate('reviews.user', 'fname')
            .sort({ 'reviews.createdOn': -1 });

            return res.json({ success: true, review: reviews });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async (req, res) => {

    try {

        const userId = res.locals.user._id;
        const productId = req.query.productId;

        const wishlist = await Wishlist.findOne({ user: userId, products: { $in: [productId] } });

        if (!wishlist) {
            const wishlist = await Wishlist.findOneAndUpdate(
                { user: userId },
                { $push: { products: productId } },
                { new: true, upsert: true }
            );


        }

        res.redirect('/wishlist');


    } catch (error) {
        console.log(error.message)
    }
}

const loadWishlist = async (req, res) => {
    try {

        const userId = res.locals.user._id;

        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

        res.render('wishlist', { wishlist: wishlist });

    } catch (error) {
        console.log(error.message)
    }
}

const removeFromWishlist = async (req, res) => {

    try {

        const productId = req.params.productId;
        const userId = res.locals.user._id;

        await Wishlist.updateOne(
            { user: userId },
            { $pull: { products: productId } }
        );

        res.redirect('/wishlist');

    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadUserAccount,
    loadOrders,
    loadAddress,
    loadNewAddress,
    addNewAddress,
    loadEditAddress,
    updateAddress,
    setPrimaryAddress,
    loadWallet,
    reviewProduct,
    addToWishlist,
    loadWishlist,
    removeFromWishlist

}