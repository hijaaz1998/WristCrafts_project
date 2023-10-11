const User = require('../model/userModel');
const Product = require('../model/productModel');
const Orders = require('../model/ordersModel');

const loadOrders = async (req, res) => {
    try {

        const page = req.query.page || 1;
        const itemsPerPage = 10;
        const skip = (page - 1) * itemsPerPage;

        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / itemsPerPage)

        const orders = await Orders.find({}).populate('user').sort({ createdOn: -1 }).skip(skip).limit(itemsPerPage);

        res.render('orders', { orders: orders, currentPage: page, totalPages: totalPages });

    } catch (error) {

    }
}

const loadOrderDetails = async (req, res) => {

    try {

        const orderId = req.query.orderId;
        const orders = await Orders.findById({ _id: orderId })
            .populate({
                path: 'user',
                populate: { path: 'Address' }
            })
            .populate('products.product');

        res.render('adminOrderDetails', { orders: orders })

    } catch (error) {

    }
}

const acceptOrder = async (req, res) => {
    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        order.orderStatus = 'Accepted';

        await order.save();

        res.redirect('/admin/orders')

    } catch (error) {

    }
}

const rejectOrder = async (req, res) => {
    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        order.orderStatus = 'Rejected';

        await order.save();

        res.redirect('/admin/orders')

    } catch (error) {

    }
}

const orderPacked = async (req, res) => {
    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        order.orderStatus = 'Packed';

        await order.save();

        res.redirect('/admin/orders')

    } catch (error) {

    }
}

const orderShipped = async (req, res) => {
    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        order.orderStatus = 'Shipped';

        await order.save();

        res.redirect('/admin/orders')

    } catch (error) {

    }
}

const orderDelivered = async (req, res) => {
    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        order.orderStatus = 'Delivered';

        order.paymentStatus = 'Paid';

        await order.save();

        res.redirect('/admin/orders')

    } catch (error) {

    }
}

const acceptReturnRequest = async (req, res) => {
    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        const userId = order.user;
        console.log("userId",userId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.walletBalance += order.total;
        user.transactions.push({
            type: 'credit',
            amount: order.total,
            date: new Date()
        });

        await user.save();
        

        await Orders.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus: 'Returned', paymentStatus: 'Cancelled', returnStatus: 'Accepted' } },
            { new: true }
        );

        for (const orderItem of order.products) {
            const productId = orderItem.product;
            const returnedQuantity = orderItem.quantity;

            const product = await Product.findById(productId);

            if (product) {
                product.quantity += returnedQuantity;

                await product.save();
            }
        }

        res.redirect('/admin/orders')

    } catch (error) {
        console.error('Error in returnOrder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    loadOrders,
    loadOrderDetails,
    acceptOrder,
    rejectOrder,
    orderPacked,
    orderShipped,
    orderDelivered,
    acceptReturnRequest
}