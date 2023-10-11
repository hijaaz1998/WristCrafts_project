const Category = require('../model/categoryModel');

const loadCategory = async (req, res) => {

    try {
        const Categories = await Category.find();
        res.render('category', { Category: Categories, message: '', errMessage: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const insertCategory = async (req, res) => {
    try {
        const name = req.body.name.toUpperCase();
        const category = await Category.find({ IsDeleted: false });
        const categoryName = await Category.findOne({ name: name });

        if (categoryName) {
            if (categoryName.IsDeleted) {
                categoryName.IsDeleted = !categoryName.IsDeleted;
                await categoryName.save();
                res.redirect('/admin/category');
            } else {
                res.render('category', { message: '', errMessage: 'Category Already Exists!!!', Category: category });
            }
        } else {
            let newCategory = new Category({
                name: name
            });

            await newCategory.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCategory = async (req, res) => {

    try {
        console.log(req.body.id)
        const Data = await Category.findById(req.body.id);

        if (Data) {
            Data.IsDeleted = !Data.IsDeleted;
            await Data.save();
        }

        const category = await Category.find()

        res.json({success : true, category: category})

    } catch (error) {
        console.log(error.message)
    }
}

const editCategory = async (req, res) => {

    try {

        const Data = await Category.findById(req.query.id);
        res.render('editCategory', { Category: Data, errMessage: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req, res) => {

    try {

        const name = req.body.name.toUpperCase();
        const Data = await Category.findById(req.body.id)
        const data = await Category.findOne({ name: name })

        if (data) {
            res.render('editCategory', { errMessage: 'Category Already Exists!!!', Category: Data });
        } else {
            await Category.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: name } })
            res.redirect('/admin/category');
        }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCategory,
    insertCategory,
    deleteCategory,
    editCategory,
    updateCategory
}