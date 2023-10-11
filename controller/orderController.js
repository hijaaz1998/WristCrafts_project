const User = require('../model/userModel');
const Product = require('../model/productModel');
const Orders = require('../model/ordersModel');
const mongoose = require('mongoose');
const UserHelper = require('../helpers/userHelper');
const Coupons = require('../model/couponModel');
const { ObjectId } = mongoose.Types;

const PDFDocument = require('pdfkit');
const fs = require('fs')

const PaymentMethod = {cod: 'COD', wallet: 'wallet', onlinePayment: 'onlinePyment' };
Object.freeze(PaymentMethod);

const loadCheckout = async (req, res) => {
    try {
        const total = req.query.total;

        const userId = res.locals.user;

        const user = await User.findById(userId._id).populate('cart.products');

        const address = user.Address;

        const currentDate = new Date();

        const validCoupons = await Coupons.find({
            validity: { $gte: currentDate },
            user: { $nin: [userId] },
        });

        const couponsGreaterThanTotal = validCoupons.filter(coupon => coupon.minPurchase < total);



        res.render('checkout', { user: user, address: address, coupons: couponsGreaterThanTotal, walletBalance: user.walletBalance });
    } catch (error) {
        console.log(error.message);
    }
}


const placeOrder = async (req, res) => {
    try {

        const userId = res.locals.user._id;
        const couponId = req.params.couponId;

        const {
            cart,
            selectedAddress,
            paymentMethod,
            total,
            discountedPrice,
        } = req.body;
        const selectedAddressId = new mongoose.Types.ObjectId(selectedAddress);

        console.log("cart", cart);

        const products = cart.map((item) => ({
            product: item.products._id,
            quantity: item.quantity,
            price: item.products.salePrice,
        }));


        for (const item of cart) {
            const orderedQuantity = item.quantity;

            const product = await Product.findById(item.products._id);

            if (orderedQuantity > product.quantity) {
                return res.status(400).json({ error: 'Insufficient stock' });
            }

            product.quantity -= orderedQuantity;

            await product.save();
        }


        const newOrder = new Orders({
            user: userId,
            products: products,
            address: selectedAddressId,
            createdOn: new Date(),
            paymentMethod: paymentMethod,
            orderStatus: 'Pending',
            total: total,
            discountedPrice: discountedPrice
        });

        const savedOrder = await newOrder.save();

        await User.findByIdAndUpdate(userId, { cart: [] });

        if (couponId) {
            const coupon = await Coupons.findById(couponId);
            coupon.user.push(userId);

            await coupon.save();
        }

        if (savedOrder.paymentMethod === PaymentMethod.cod) {

            res.json({ codSuccess: true, savedOrder });
        } else if (savedOrder.paymentMethod === PaymentMethod.wallet) {

            const user = await User.findById(userId);
            if (user.walletBalance < savedOrder.total) {
                return res.status(400).json({ message: 'Insufficient balance to complete the order' });
            } else {
                user.walletBalance -= savedOrder.total;

                user.transactions.push({
                    type: 'debit',
                    amount: savedOrder.total,
                    date: new Date()
                })
                savedOrder.orderStatus = 'Accepted';
                savedOrder.paymentStatus = 'Paid';
                await savedOrder.save();
                await user.save();
                res.json({ walletSuccess: true })
            }

        } else {
            UserHelper.generateRazorpay(savedOrder._id, savedOrder.total).then((response) => {
                res.json({ response })
            })
        }


    } catch (error) {

        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while placing the order' });
    }
};


const loadConfirmOrder = async (req, res) => {
    try {

        res.render('orderPlaced')

    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;

        const order = await Orders.findById(orderId)
            .populate({
                path: 'user',
                populate: { path: 'Address' }
            })
            .populate('products.product');

        const selectedAddressId = order.address;
        const selectedAddress = order.user.Address.find(address => address._id.toString() === selectedAddressId.toString());

        if (!selectedAddress) {
            throw new Error('Selected address not found');
        }
        res.render('orderDetails', { orders: order, address: selectedAddress });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


const cancelOrder = async (req, res) => {
    try {

        const userId = res.locals.user._id;
        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId);

        if (order.paymentMethod === PaymentMethod.onlinePayment ||
            order.paymentMethod === PaymentMethod.wallet ||
            order.paymentMethod === PaymentMethod.cod && order.orderStatus.toLowerCase() === 'delivered') {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update the user's wallet balance and add a transaction
            user.walletBalance += order.total;
            user.transactions.push({
                type: 'credit',
                amount: order.total,
                date: new Date()
            });

            await user.save();
        }

        await Orders.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus: 'Cancelled', paymentStatus: 'Cancelled' } },
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
        return res.json({ success: true });

    } catch (error) {
        console.error('Error in returnOrder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const verifyPayment = async (req, res) => {
    try {
        console.log(req.body);
        UserHelper.verifyPayment(req.body).then(() => {
            UserHelper.changePaymentStatus(req.body.order.receipt).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false })
        })

    } catch (error) {

    }
}

const selectCoupon = async (req, res) => {
    try {

        const couponId = req.params.couponId;

        const coupon = await Coupons.findById(couponId);

        res.json(coupon);

    } catch (error) {

    }
}

const applyCoupon = async (req, res) => {
    try {

        const couponId = req.params.couponId;
        const coupon = await Coupons.findById(couponId);

        const subTotal = parseInt(req.query.subtotal);

        let discount = subTotal * (coupon.discountPercentage / 100);

        if (discount > coupon.maxDiscountValue) {
            discount = coupon.maxDiscountValue;
        }
        const discountedPrice = subTotal - discount;

        res.json({ discountedPrice, discount })




    } catch (error) {

    }
}

const downloadInvoice = async (req, res) => {

    try {

        const orderId = req.params.orderId;

        const order = await Orders.findById(orderId)
            .populate('user')
            .populate({
                path: 'products.product',
                model: 'Product',
            });

        const stream = fs.createWriteStream('invoice.pdf');
        doc.pipe(stream);

        const user = order.user;
        const selectedAddressId = order.address;
        const selectedAddress = user.Address.id(selectedAddressId);

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);
        doc.fontSize(14).text('Invoice', { align: 'center' }).moveDown(1);

        doc.fontSize(12).text(`Order ID: ${orderId}`);
        doc.fontSize(12).text(`Order Date: ${order.createdOn}`);
        doc.fontSize(12).text(`Payment Method: ${order.paymentMethod}`);
        doc.fontSize(12).text(`Order Status: ${order.orderStatus}`).moveDown(1);


        doc.end();

    } catch (error) {
        console.log(error.message);
    }   
}

const orderInvoice = async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Orders.findById(orderId)
        .populate('user')
        .populate({
            path: 'products.product',
            model: 'Product',
        });

    const selectedAddressId = order.address;
    const selectedAddress = order.user.Address.find(
        (address) => address._id.toString() === selectedAddressId.toString()
    );

    const doc = new PDFDocument();

    const stream = fs.createWriteStream('invoice.pdf');
    doc.pipe(stream);

    doc.font('Helvetica-Bold');
    doc.fontSize(18);

    doc.text('Invoice', { align: 'center' }).moveDown();

    doc.fontSize(12);
    doc.text(`Invoice #: ${order._id}`, { align: 'right' });
    doc.text(`Order Date: ${order.createdOn.toDateString()}`);
    doc.text(`Order Status: ${order.orderStatus}`).moveDown();

    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text('Product', 100, 200);
    doc.text('Qty', 250, 200);
    doc.text('Unit Price', 350, 200);
    doc.text('SubTotal', 450, 200);

    let yPos = 230;
    order.products.forEach((product) => {
        const subtotal = product.product.salePrice * product.quantity;
        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`${product.product.brandName} ${product.product.productName}`, 100, yPos)
            .text(product.quantity.toString(), 250, yPos)
            .text(`Rs. ${product.product.salePrice.toFixed(2)}`, 350, yPos)
            .text(`Rs. ${subtotal.toFixed(2)}`, 450, yPos);
        yPos += 20;
    });
    doc.moveDown();

    doc.text('Billing Address:', 100, 380);
    doc.moveDown();

    const {
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
    } = selectedAddress;

    const fullAddress = `${address}, ${city}, ${state}, ${pincode}`;

    const addressLines = fullAddress.split(', ');

    addressLines.forEach((line, index) => {
        doc.text(line, 100, 400 + index * 20);
    });

    doc.text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Phone: ${phone}`).moveDown();

    doc.text(`Discount: Rs. ${order.discountedPrice.toFixed(2)}`);
    doc.font('Helvetica-Bold');
    doc.fontSize(18);
    doc.text(`Grand Total: Rs. ${order.total.toFixed(2)}`).moveDown();

    doc.end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    doc.pipe(res);
};

const paymentFailed = async (req, res) => {

    try {

        const query = {
            paymentMethod: 'onlinePayment',
            paymentStatus: 'Pending',
            orderStatus: 'Pending'
        };

        const pendingOrder = await Orders.findOne(query);

        const orderProducts = pendingOrder.products;

        for (const orderProduct of orderProducts) {
            const productId = orderProduct.product.toString();
            const quantity = orderProduct.quantity;

            // Find the product in the Product model by its ID
            const product = await Product.findById(productId);

            if (product) {
                // Decrease the product stock by the quantity from the order
                product.quantity += quantity;

                // Save the updated product
                await product.save();
            }

        }

        pendingOrder.orderStatus = 'Cancelled';
        pendingOrder.paymentStatus = 'Cancelled';

        const updated = await pendingOrder.save();

        if (updated) {
            res.redirect('/cart');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const returnOrderRequest = async(req, res) => {

    try {

        const orderId = req.params.orderId;

        await Orders.findByIdAndUpdate(
            orderId,
            {$set: { returnStatus: 'Requested' }}
        )

        res.json({ success: true });
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadCheckout,
    placeOrder,
    loadConfirmOrder,
    loadOrderDetails,
    verifyPayment,
    cancelOrder,
    selectCoupon,
    applyCoupon,
    downloadInvoice,
    orderInvoice,
    paymentFailed,
    returnOrderRequest,
}