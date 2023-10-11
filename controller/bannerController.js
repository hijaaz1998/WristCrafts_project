const Banner = require('../model/bannerModel');

const loadAddBanner = async (req, res) => {

    try {

        res.render('addBanner')

    } catch (error) {

    }
}

const addBanner = async (req, res) => {

    try {

        const img = req.files.map((file) => file.filename);

        const banner = new Banner({

            title: req.body.title,
            description: req.body.description,
            image: img

        });

        const banners = await banner.save();

        if (banners) {
            res.redirect('/admin/banners');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadBanner = async (req, res) => {

    try {

        const banners = await Banner.find();

        res.render('banners', { Banners: banners })

    } catch (error) {
        console.log(error.message)
    }
}

const toggleBanner = async (req, res) => {

    try {

        const bannerId = await Banner.findById(req.query.id);

        await Banner.updateMany({ _id: { $ne: bannerId } }, { $set: { isActive: false } });

        const updatedBanner = await Banner.findByIdAndUpdate(bannerId, { isActive: true }, { new: true });

        if (updatedBanner) {
            res.redirect('/admin/banners')
        }

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadAddBanner,
    addBanner,
    loadBanner,
    toggleBanner
}