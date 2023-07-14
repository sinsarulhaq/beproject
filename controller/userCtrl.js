const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");

//create a user
const createUser = asyncHandler( async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email : email});
    if(!findUser){
        // create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        //user already exists
        throw new Error('User Already Exists');
    }
});

//login a user
const loginUserCtrl = asyncHandler( async(req, res) => {
    const { email, password  } = req.body;
    //check if user exists or not
    const findUser = await User.findOne({ email });
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findUser?._id);
        res.cookie()
        //1:55:52
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    }else{
        throw new Error("Invalid credentials")
    }
});

//update a user
const updateaUSer = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body.firstname,
            lastname: req?.body.lastname,
            email: req?.body.email,
            mobile: req?.body.mobile
        }, {
            new: true
        });
        res.json(updateUser)
    }catch(error){
        throw new Error(error)
    }
});

//get all users
const getallUser = asyncHandler(async (req, res) => {
    try{
        const getUser = await User.find();
        res.json(getUser); 
    }catch(error){
        throw new Error(error)
    }
});

//gey a single user
const getaUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaUSer = await User.findById(id);
        res.json(getaUSer)
    } catch (error) {
        throw new Error(error);
    }
});

//delete a user
const deleteaUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json(deleteaUser)
    } catch (error) {
        throw new Error(error);
    }
});

//block a user (only for admin)
const blockUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true
        },{
            new: true
        })
        res.json({
            message: "User blocked",

        })
    } catch (error) {
        throw new Error(error);
    }
});

//unblock user (only for admin)
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false
        },{
            new: true
        });
        res.json({
            message: "User unblocked",

        })
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = { createUser, loginUserCtrl, getallUser, getaUser,  deleteaUser, updateaUSer, blockUser, unblockUser};