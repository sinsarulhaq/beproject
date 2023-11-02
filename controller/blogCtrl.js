const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");


const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updateBlog);
    } catch (error) {
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const getBlog = await Blog.findById(id).populate('likes').populate('dislikes');
       const updateViews = await Blog.findByIdAndUpdate(id, {
            $inc:{numViews: 1},
        },{new:true});
        res.json(getBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const getAllBlog = asyncHandler(async (req, res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json(deleteBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.body;
        validateMongoDbId(blogId);
        //find the blog which you want to be liked
        const blog = await Blog.findById(blogId);
        //find the login user
        const logonUserId = req?.user?._id
        //find if the user has liked the blog 
        const isLiked = blog.isLiked;
        //find the user has dilike the blog 
        const alreadyDisLiked = blog.dislikes?.find((userId) => userId?.toString() === logonUserId.toString())
        if(alreadyDisLiked){
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $pull: {dislikes: logonUserId},
                isDislike: false
            }, {new: true});
            res.json(blog)
        }

        if(isLiked){
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $pull: {likes: logonUserId},
                isLiked: false
            }, {new: true});
            res.json(blog)
        }else{
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $push: {likes: logonUserId},
                isLiked: true
            }, {new: true});
            res.json(blog)
        }
    } catch (error) {
        throw new Error(error)
    }
});

const dislikeBlog = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.body;
        validateMongoDbId(blogId);
        //find the blog which you want to be liked
        const blog = await Blog.findById(blogId);
        //find the login user
        const logonUserId = req?.user?._id
        //find if the user has liked the blog 
        const isDisLiked = blog.isDislike;
        //find the user has dilike the blog 
        const alreadyLiked = blog.likes?.find((userId) => userId?.toString() === logonUserId.toString())
        if(alreadyLiked){
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $pull: {likes: logonUserId},
                isLiked: false
            }, {new: true});
            res.json(blog)
        }

        if(isDisLiked){
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $pull: {dislikes: logonUserId},
                isDislike: false
            }, {new: true});
            res.json(blog)
        }else{
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $push: {dislikes: logonUserId},
                isDislike: true
            }, {new: true});
            res.json(blog)
        }
    } catch (error) {
        throw new Error(error)
    }
});

const uploadImages = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images")
        const urls = [];
        const files = req.files;
        for(const file of files){
            const {path} = file;
            const newPath = await uploader(path);
            console.log(newPath, 'new');
            urls.push(newPath);
        }
        const findProduct = await Blog.findByIdAndUpdate(id, {
            images:urls.map((file) => {
                return file;
            }, {
                new: true
            })
        })
        res.json(findProduct)
    } catch (error) {
        throw new Error(error);
    }
});
//7:06
module.exports = { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog, uploadImages };