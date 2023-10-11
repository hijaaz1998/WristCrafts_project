const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const mongoose = require('mongoose')

const loadProducts = async (req, res) => {

    try {


        const products = await Product.find().populate('Category');
        res.render('products', { Products: products });

    } catch (error) {
        console.log(error.message);
    }
}

const addProducts = async (req, res) => {

    try {

        const img = req.files.map((file) => file.filename);

        const product = new Product({

            productName: req.body.productName,
            brandName: req.body.brandName,
            Category: req.body.category,
            quantity: req.body.quantity,
            regularPrice: req.body.regularPrice,
            salePrice: req.body.salePrice,
            description: req.body.description,
            image: img
        });


        const products = await product.save()

        if (products) {
            res.redirect('/admin/products');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadAddProducts = async (req, res) => {

    try {

        const category = await Category.find({ IsDeleted: false });
        res.render('addProducts', { category: category });


    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async (req, res) => {

    try {

        const productData = await Product.findById(req.body.id);

        if (productData) {
            productData.isDeleted = !productData.isDeleted;
            await productData.save();
        }

        const products = await Product.find().populate('Category');

        res.json({success : true, products: products})

    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProducts = async (req, res) => {

    try {


        const category = await Category.find({ IsDeleted: false });
        const productData = await Product.findById(req.query.id).populate('Category');

        res.render('editProducts', { Product: productData, category: category });

    } catch (error) {
        console.log(error.message);
    }
}

const updateProducts = async (req, res) => {

    try {

        const img = req.files.map((file) => file.filename);
        const updatedC = new mongoose.Types.ObjectId(req.body.category);

        console.log(img);
        if (req.body.removedImageFilenames && req.body.removedImageFilenames.length > 0) {

            const removedImageFilenames = JSON.parse(req.body.removedImageFilenames);
            const result = await Product.updateOne(
                { _id: req.body.id },
                { $pull: { image: { $in: removedImageFilenames } } }
            );
        }

        const product = await Product.findById(req.body.id);
        console.log(product);

        if(img.length > 0){
            product.productName = req.body.productName
            product.description = req.body.description
            product.brandName = req.body.brandName
            product.Category = updatedC
            product.quantity = req.body.quantity
            product.regularPrice = req.body.regularPrice
            product.salePrice = req.body.salePrice
            product.image = product.image.concat(img);        
        }

        product.productName = req.body.productName
        product.description = req.body.description
        product.brandName = req.body.brandName
        product.Category = updatedC
        product.quantity = req.body.quantity
        product.regularPrice = req.body.regularPrice
        product.salePrice = req.body.salePrice 


        const updated = await product.save();

        console.log(updated);
        

        res.json({success: true})

    } catch (error) {
        console.log(error.message);
    }
}

const removeImage = async (req, res) => {

    try {

        const imageId = req.query.imageId;
        const productId = req.query.productId;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                $pull: { image: { _id: imageId } }
            },
            { new: true }
        );

        await updatedProduct.save();

        if (updatedProduct) {
            res.redirect('/admin/editProduct');
        }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProducts,
    addProducts,
    loadAddProducts,
    deleteProduct,
    loadEditProducts,
    updateProducts,
    removeImage
}