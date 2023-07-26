const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProducts = asyncHandler(async (req, res) => {
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body)
        res.json(newProduct);         
    }catch(err){
        throw new Error(err)
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if(req.body.title){
            req.body.slug =  slugify(req.body.title);
        }
        const updatedProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {new:true});
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(updatedProduct);
    } catch (error) {
        throw new Error(error)
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProduct = await Product.findOneAndDelete({_id: id})
        if (!deleteProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error)
    }
});


const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }catch(err){
        throw new Error(err);
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    // 1 way) const getAllProducts = await Product.find(req.query)
        // 2 way const getAllProducts = await Product.find({
        //     brand : req.query.brand,
        //     cateogory : req.query.cateogory
        // });
    try {
        //Filtering
        const queryObject = {...req.query};

        const excludeFields = ['page', 'sort', 'limit', 'fields'];

        excludeFields.forEach((el) => delete queryObject[el]);
        
        let queryStrng = JSON.stringify(queryObject);

        queryStrng = queryStrng.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        
        let query = Product.find(JSON.parse(queryStrng));

        //Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        }else{
            query = query.sort('-createdAt')
        }

        // limiting the fields
        if(req.query.fields){
           const fields = req.query.fields.split(',').join(' ');
           query = query.select(fields)
        }else{
            query = query.select('-__v');
        }

        //Pagination
        //3:31:34
        const product = await query
        res.json(product);

    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createProducts, getaProduct, getAllProduct, updateProduct, deleteProduct }


// const a = asyncHandler(async (req, res) => {
//     try {
        
//     } catch (error) {
        
//     }
// });