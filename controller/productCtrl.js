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
    try {
        const getAllProducts = await Product.find();
        res.json(getAllProducts)
    } catch (error) {
        throw new Error(error);
    }
})

module.exports = { createProducts, getaProduct, getAllProduct, updateProduct, deleteProduct }


// const a = asyncHandler(async (req, res) => {
//     try {
        
//     } catch (error) {
        
//     }
// });