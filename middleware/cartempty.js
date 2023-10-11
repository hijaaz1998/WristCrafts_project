const User = require('../model/userModel');

const checkCart = async(req, res, next) => {

    try {

        const userId = res.locals.user._id;
        const user = await User.findById(userId);

        if(user.cart.length === 0){
            console.log("kkkk");
            res.json({cartChange: true});
        } else {
            console.log("hlello");
            next();
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const checkCart1 = async(req, res, next) => {

    try {

        const userId = res.locals.user._id;
        const user = await User.findById(userId);

        if(user.cart.length === 0){
            console.log("kkkk");
            res.redirect('/cart')
        } else {
            console.log("hlello");
            next();
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {

    checkCart,
    checkCart1

}