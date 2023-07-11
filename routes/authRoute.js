const express = require("express");
const { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, updateaUSer } = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getallUser);
router.get('/:id', authMiddleWare, isAdmin, getaUser);
router.delete('/:id', deleteaUser);
router.put("/:id", updateaUSer);

module.exports = router;