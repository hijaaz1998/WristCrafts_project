const Coupon = require('../model/couponModel');
const couponCode = require('coupon-code');

const loadCoupons = async (req, res) => {

  try {

    const currentDate = new Date();

    const validCoupons = await Coupon.find({
      validity: { $gte: currentDate },
    }).sort({ validity: 1 });


    res.render('coupons', { coupons: validCoupons })

  } catch (error) {
    console.log(error.message);
  }
}

const loadAddCoupons = async (req, res) => {

  try {

    res.render('addCoupon')

  } catch (error) {
    console.log(error.message);
  }
}

const addCoupons = async (req, res) => {
  try {

    const code = couponCode.generate({ parts: 1, partLen: 8 });
    const today = new Date();
    const validityString = req.body.validity;
    const numericValidity = parseInt(validityString, 10);
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + numericValidity);

    const newCoupon = new Coupon({
      code: code,
      discountPercentage: req.body.discountPercent,
      name: req.body.name,
      validity: expirationDate,
      minPurchase: req.body.minPurchase,
      maxDiscountValue: req.body.maxDiscountValue,
    });


    const savedCoupon = await newCoupon.save();

    if (savedCoupon) {
      res.redirect('/admin/coupons');
    }
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  loadCoupons,
  loadAddCoupons,
  addCoupons

}