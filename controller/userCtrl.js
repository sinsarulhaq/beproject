const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");

//create a user
const createUser = asyncHandler( async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email : email});
    if(!findUser){
        // create a new user
        const newUser = await User.create(req.body);
        console.log(req.body)
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
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
         refreshToken :refreshToken,
        }, {new: true})
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, 
            maxAge: 72*60*60*1000,
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    }else{
        throw new Error("Invalid credentials")
    }
});

//handle refreshToken
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No refresh token in cookies');
    const refreshToken = cookie?.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({ refreshToken });
    if(!user) throw new Error('no refresh token present in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECREAT, (err, decoded) => {
        if(err || user.id !== decoded.id){
            throw new Error('There is something wrong with refresh token')
        }
    })
    const accessToken = generateToken(user.id)
    res.json({accessToken});
});

//logout functionality

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No refresh token in cookies');
    const refreshToken = cookie?.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) {
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate({ refreshToken: refreshToken }, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204);
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

  const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
  
    if (password) {
      user.password = password;
  
      // Set the passwordChangedAt field to the current date and time
      user.passwordChangedAt = new Date();
      await user.createPasswordResetToken();
      user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  });
  
  const forgotPasswordToken = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error('user not found with this email');

    try {
        const token = await user.createPasswordResetToken();
        await User.save();
        const resetUrl = `Hi, please follow this link to reset your password. This make valid till 10 min from now <a href=''http://localhost5000/api/user/reset-password/${token}:>click here</a>`
        const data = {
            to: email,
            text: 'Hey User',
            subject: "Forgot password Link",
            htm: resetUrl
        }
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
  })


module.exports = { createUser, loginUserCtrl, getallUser, getaUser,  deleteaUser, updateaUSer, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken };