const express = require('express');
const userRoute = express();

const userController = require('../controller/userController');
const loginedUserController = require('../controller/loginedUserController');
const cartController = require('../controller/cartController');
const blocked = require('../middleware/blockedMiddleware');
const validate = require('../middleware/authMiddleware');
const orderController = require('../controller/orderController');
const cartCheck = require('../middleware/cartempty');


userRoute.set('views', './views/user');
userRoute.all('*',validate.checkUser)


userRoute.get('/', userController.loadHome);
userRoute.get('/home',  userController.loadHome1);


userRoute.get('/login', userController.loadLogin);
userRoute.post('/login',  userController.verifyLogin)
userRoute.get('/logout', userController.logout);


userRoute.get('/forgotPassword', userController.forgotPassword);
userRoute.post('/forgotPassword', userController.forgotOtpVerify);
userRoute.get('/forgotVerify', userController.loadForgotOtpVerify);
userRoute.post('/forgotVerify', userController.forgotPasswordVerify);


userRoute.get('/register', userController.loadRegister);
userRoute.post('/register', userController.sendOtp);
userRoute.get('/verify', userController.otpVerify);
userRoute.post('/verify', userController.verified);


userRoute.get('/shop', userController.loadShop);
userRoute.get('/productDetail', userController.loadProductDeatils);


userRoute.get('/account', blocked.checkBlocked, validate.requireAuth, loginedUserController.loadUserAccount );
userRoute.get('/orders',  blocked.checkBlocked, validate.requireAuth, loginedUserController.loadOrders);
userRoute.get('/address',  blocked.checkBlocked, validate.requireAuth, loginedUserController.loadAddress);
userRoute.get('/addNewAddress', blocked.checkBlocked, validate.requireAuth, loginedUserController.loadNewAddress )
userRoute.post('/addNewAddress', blocked.checkBlocked, validate.requireAuth, loginedUserController.addNewAddress )
userRoute.get('/editAddress', blocked.checkBlocked, validate.requireAuth, loginedUserController.loadEditAddress )
userRoute.post('/editAddress', blocked.checkBlocked, validate.requireAuth, loginedUserController.updateAddress )
userRoute.get('/wallet', blocked.checkBlocked, validate.requireAuth, loginedUserController.loadWallet );
userRoute.post('/productReview/:productId', blocked.checkBlocked, validate.requireAuth, loginedUserController.reviewProduct );
userRoute.get('/wishlist', blocked.checkBlocked, validate.requireAuth, loginedUserController.loadWishlist );
userRoute.get('/addToWishlist', blocked.checkBlocked, validate.requireAuth, loginedUserController.addToWishlist );
userRoute.get('/removeFromWishlist/:productId', blocked.checkBlocked, validate.requireAuth, loginedUserController.removeFromWishlist );
userRoute.get('/searchProducts', userController.searchProducts)


userRoute.post('/addToCart', blocked.checkBlocked, validate.requireAuth, cartController.addToCart);
userRoute.get('/cart', blocked.checkBlocked, validate.requireAuth, cartController.loadCart);
userRoute.get('/removeFromCart/:productId', blocked.checkBlocked, validate.requireAuth, cartController.removeFromCart);
userRoute.get('/clearCart/:userId', blocked.checkBlocked, validate.requireAuth, cartController.clearCart);
userRoute.get('/increment', blocked.checkBlocked, validate.requireAuth, cartController.incrementItem);
userRoute.get('/decrement', blocked.checkBlocked, validate.requireAuth, cartController.decrementItem);
userRoute.get('/updateCart', blocked.checkBlocked, validate.requireAuth, cartController.updateCart);


userRoute.post('/checkout', blocked.checkBlocked, cartCheck.checkCart1, validate.requireAuth, orderController.loadCheckout);
userRoute.post('/placeOrder/:couponId', blocked.checkBlocked,  cartCheck.checkCart, validate.requireAuth, orderController.placeOrder);
userRoute.post('/placeOrder/', blocked.checkBlocked, cartCheck.checkCart, validate.requireAuth, orderController.placeOrder);
userRoute.get('/selectCoupon/:couponId', blocked.checkBlocked, validate.requireAuth, orderController.selectCoupon);
userRoute.get('/applyCoupon/:couponId', blocked.checkBlocked, validate.requireAuth, orderController.applyCoupon);


userRoute.get('/orderConfirmed', blocked.checkBlocked, validate.requireAuth, orderController.loadConfirmOrder)
userRoute.get('/viewOrderDetails', blocked.checkBlocked, validate.requireAuth, orderController.loadOrderDetails)
userRoute.get('/download-invoice/:orderId', blocked.checkBlocked, validate.requireAuth, orderController.orderInvoice)
userRoute.post('/returnOrder/:orderId', blocked.checkBlocked, validate.requireAuth, orderController.returnOrderRequest)
userRoute.post('/cancelOrder/:orderId', blocked.checkBlocked, validate.requireAuth, orderController.cancelOrder)


userRoute.post('/verifyPayment', blocked.checkBlocked, validate.requireAuth, orderController.verifyPayment );
userRoute.get('/paymentFailed', blocked.checkBlocked, validate.requireAuth, orderController.paymentFailed)

module.exports = userRoute