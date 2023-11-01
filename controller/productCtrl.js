const Product = require("../models/productModel");
const User = require("../models/userModel");
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
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        console.log(page, limit, skip);
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount){
                throw new Error('This is Doesnt Exist')
            }
        }
        query = query.skip(skip).limit(limit)

        const product = await query
        res.json(product);

    } catch (error) {
        throw new Error(error);
    }
});

const addTowhishlist = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {prodId} = req.body;

    try {
        const user = await User.findById(_id);
         const alreadyAdded =  user.wishlist.find((id) => id.toString() === prodId);
         console.log('hello', user);
        if(alreadyAdded){
            let user = await User.findByIdAndUpdate(_id, {
                $pull: {wishlist: prodId},
            }, {new: true});
              res.json(user);
        }else{
            let user = await User.findByIdAndUpdate(_id, {
                $push: {wishlist: prodId},
            }, {new: true});
            res.json(user);
        };
    } catch (error) {
        throw new Error(error);
    }
});


const rating = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    const {star, prodId, comment} = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());
        if(alreadyRated){
            const updateRating = await Product.updateOne(
                {
                    ratings: {$elemMatch: alreadyRated}
                },
                {
                    $set: {"ratings.$.star": star, "ratings.$.comment": comment}
                },
                {
                    new:true
                }
            );
            res.json(updateRating);
        }else{
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings:{
                        star: star,
                        comment: comment,
                        postedby: _id,
                    }
                }
            }, {new: true});
            }
            const getAllRating = await Product.findById(prodId);
            let totalRating = getAllRating.ratings.length;
            let ratingSum = getAllRating.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
            let actualRating = Math.round(ratingSum / totalRating);
           let finalproduct =  await  Product.findByIdAndUpdate(
            prodId,
             {
                totalrating : actualRating
            }, 
            {new:true}
            );
            res.json(finalproduct);
        
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createProducts, getaProduct, getAllProduct, updateProduct, deleteProduct, addTowhishlist, rating }