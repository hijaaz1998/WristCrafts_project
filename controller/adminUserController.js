const User = require('../model/userModel');
const Banner = require('../model/bannerModel');


const loadUsers = async (req, res) => {

    try {

        const userData = await User.find({ isAdmin: 0 }).sort({ fname: 1 });
        res.render('users', { users: userData });

    } catch (error) {
        console.log(error.message);
    }
}

const toggleUsers = async (req, res) => {

    try {

        const userData = await User.findById(req.body.id);

        if (userData) {
            userData.isActive = !userData.isActive;
            await userData.save();
            
        }

        const usersData = await User.find({ isAdmin: 0 }).sort({ fname: 1 });

        res.json({success : true, usersData: usersData})

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadUsers,
    toggleUsers,

}