const Admin = require('../model/adminModel');
const Orders = require('../model/ordersModel');

const loadLogin = async (req, res) => {

    try {

        res.render('adminLogin', { errMessage: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const verifyAdmin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email })
        if (adminData) {

            if (adminData.password === password) {
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard')
            } else {
                res.render('adminLogin', { errMessage: "Invalid Email or Password" })
            }

        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashBoard = async (req, res) => {

    try {

        const orders = await Orders.find({ orderStatus: 'Delivered' });

        let totalRevenue = 0;
        for (const order of orders) {
            totalRevenue += order.total;
        }

        const deliveredOrdersCount = await Orders.countDocuments({ orderStatus: 'Delivered' });

        const deliveredOrders = await Orders.find({ orderStatus: 'Delivered' }).populate('products.product');

        let totalProductCount = 0;
        for (const order of deliveredOrders) {
            totalProductCount += order.products.reduce((total, product) => total + product.quantity, 0);
        }


        const monthlyEarning1 = (totalRevenue * 35) / 100;
        const monthlyEarning = monthlyEarning1.toLocaleString();

        const revenue = totalRevenue.toLocaleString();

        res.render('dashboard', { errMessage: '', revenue: revenue, totalProduct: totalProductCount, orders: deliveredOrdersCount, monthlyEarning: monthlyEarning });

    } catch (error) {
        console.log(error.message);
    }
}


const logout = async (req, res) => {

    try {

        req.session.admin_id = null;
        res.render('adminLogin', { errMessage: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const loadChart = async (req, res) => {
    try {
        const orders = await Orders.find({ orderStatus: 'Delivered' });

        // Create an object to store daily revenue data
        const dailyRevenue = {};

        for (const order of orders) {
            const orderDate = order.createdOn; // Assuming createdOn field stores order date
            const dayKey = orderDate.toISOString().split('T')[0]; // Get the date in "YYYY-MM-DD" format

            // Initialize the daily revenue if it doesn't exist
            if (!dailyRevenue[dayKey]) {
                dailyRevenue[dayKey] = 0;
            }

            // Add the order's total to the corresponding day
            dailyRevenue[dayKey] += order.total;
        }

        // Convert the daily revenue data into an array of values
        const revenueData = Object.values(dailyRevenue);
        res.json(revenueData);
    } catch (error) {
        console.log(error.message);
    }
};

const loadBarChart = async (req, res) => {
    try {
        const orders = await Orders.find({ orderStatus: 'Delivered' }).populate('products.product');

        if (!orders) {
            throw new Error('No orders found with orderStatus: Delivered');
        }
        const productCategoriesSet = new Set();
        for (const order of orders) {
            for (const product of order.products) {
                if (product.product && product.product.Category) {
                    productCategoriesSet.add(product.product.Category);
                }
            }
        }
        const productCategoriesArray = Array.from(productCategoriesSet);

        res.json(productCategoriesArray);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
};







module.exports = {
    loadLogin,
    verifyAdmin,
    loadDashBoard,
    logout,
    loadChart,
    loadBarChart
}