const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");

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

//admin login
const loginAdminCtrl = asyncHandler( async(req, res) => {
    const { email, password  } = req.body;
    //check if user exists or not
    const findAdmin = await User.findOne({ email });
    if(findAdmin.role !== 'admin') throw new Error('Not Authorized');
    if(findAdmin && await findAdmin.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(findAdmin.id, {
         refreshToken :refreshToken,
        }, {new: true})
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, 
            maxAge: 72*60*60*1000,
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
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

//save user Address
const saveAddress = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id, {
            address: req?.body.address,
        }, {
            new: true
        });
        res.json(updateUser)
    }catch(error){
        throw new Error(error)
    }
})

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
        await user.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;

        const data = {
            to: email,
            text: 'Hey User',
            subject: "Forgot password Link",
            html: resetURL
        }
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
  });

  const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  });

const getWishlist = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser)
    } catch (error) {
        throw new Error(error)
    }
});

module.exports = { createUser, loginUserCtrl, getallUser, getaUser,  deleteaUser, updateaUSer, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdminCtrl, getWishlist, saveAddress };