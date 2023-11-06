const express = require("express");
const { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, updateaUSer, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdminCtrl, getWishlist, saveAddress, userCart, getUserCart } = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);

router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdminCtrl);
router.post('/cart', authMiddleWare, userCart);
router.post('/forgot-password-token', forgotPasswordToken);
router.post('/reset-password/:token', resetPassword)
router.get('/all-users', getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get('/wishlist', authMiddleWare, getWishlist);
router.get('/wishlist', authMiddleWare, getUserCart);
router.get('/:id', authMiddleWare, isAdmin, getaUser);

router.delete('/:id', deleteaUser);
router.put("/edit-user", authMiddleWare, updateaUSer);
router.put("/save-address", authMiddleWare, saveAddress);
router.put("/block-user/:id", authMiddleWare, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleWare, isAdmin, unblockUser);
router.put('/password', authMiddleWare, updatePassword)

module.exports = router;