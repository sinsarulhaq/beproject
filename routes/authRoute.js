const express = require("express");
const { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, updateaUSer, blockUser, unblockUser, handleRefreshToken, logout } = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get('/:id', authMiddleWare, isAdmin, getaUser);
router.delete('/:id', deleteaUser);
router.put("/edit-user", authMiddleWare, updateaUSer);
router.put("/block-user/:id", authMiddleWare, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleWare, isAdmin, unblockUser);

module.exports = router;