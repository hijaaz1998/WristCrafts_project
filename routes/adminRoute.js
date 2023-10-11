const express = require('express');
const adminRoute = express();


const auth = require('../middleware/adminAuth');
const adminController = require('../controller/adminController');
const adminUserController = require('../controller/adminUserController');
const adminCategoryController = require('../controller/adminCategoryController');
const productController = require('../controller/productController');
const upload = require('../middleware/multer');
const uploadBanner = require('../middleware/banner');
const orderController = require('../controller/adminOrderController');
const couponController = require('../controller/couponController');
const bannerController = require('../controller/bannerController');


adminRoute.set('views', './views/admin');


adminRoute.get('/', auth.isLogout, adminController.loadLogin);
adminRoute.post('/adminlogin', adminController.verifyAdmin);
adminRoute.get('/dashboard', auth.isLogin, adminController.loadDashBoard);
adminRoute.get('/logout', adminController.logout);
adminRoute.get('/loadChart', auth.isLogin, adminController.loadChart);
adminRoute.get('/loadBarChart', auth.isLogin, adminController.loadBarChart);


adminRoute.get('/users', auth.isLogin, adminUserController.loadUsers);
adminRoute.post('/checkbox', auth.isLogin, adminUserController.toggleUsers);


adminRoute.get('/category', auth.isLogin, adminCategoryController.loadCategory);
adminRoute.post('/addCategory', auth.isLogin, adminCategoryController.insertCategory);
adminRoute.post('/deleteCategory', auth.isLogin, adminCategoryController.deleteCategory);
adminRoute.get('/editCategory', auth.isLogin, adminCategoryController.editCategory);
adminRoute.post('/editCategory', auth.isLogin, adminCategoryController.updateCategory);


adminRoute.get('/products', auth.isLogin, productController.loadProducts);
adminRoute.get('/addProduct', auth.isLogin, productController.loadAddProducts);
adminRoute.post('/addProduct', auth.isLogin, upload.array('images', 3), productController.addProducts);
adminRoute.get('/editProduct', auth.isLogin, productController.loadEditProducts);
adminRoute.post('/editProduct', auth.isLogin, upload.array('images', 3), productController.updateProducts);
adminRoute.post('/deleteProduct', auth.isLogin, productController.deleteProduct);
adminRoute.get('/removeImage', auth.isLogin, productController.removeImage);


adminRoute.get('/orders', auth.isLogin, orderController.loadOrders)
adminRoute.get('/viewDetails', auth.isLogin, orderController.loadOrderDetails)
adminRoute.get('/acceptOrder/:orderId', auth.isLogin, orderController.acceptOrder)
adminRoute.get('/rejectOrder/:orderId', auth.isLogin, orderController.rejectOrder)
adminRoute.get('/orderPacked/:orderId', auth.isLogin, orderController.orderPacked)
adminRoute.get('/orderShipped/:orderId', auth.isLogin, orderController.orderShipped)
adminRoute.get('/orderDelivered/:orderId', auth.isLogin, orderController.orderDelivered)
adminRoute.get('/acceptReturnRequest/:orderId', auth.isLogin, orderController.acceptReturnRequest)
adminRoute.get('/rejectReturnRequest/:orderId', auth.isLogin, orderController.orderDelivered)


adminRoute.get('/coupons', auth.isLogin, couponController.loadCoupons)
adminRoute.get('/addCoupons', auth.isLogin, couponController.loadAddCoupons)
adminRoute.post('/addCoupons', auth.isLogin, couponController.addCoupons)


adminRoute.get('/addBanners', auth.isLogin, bannerController.loadAddBanner);
adminRoute.get('/banners', auth.isLogin, bannerController.loadBanner);
adminRoute.post('/addBanners', auth.isLogin, uploadBanner.array('image', 1), bannerController.addBanner);
adminRoute.get('/bannerCheckbox', auth.isLogin, bannerController.toggleBanner);


module.exports = adminRoute;