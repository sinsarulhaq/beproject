const express = require("express");
const { createCategory, updateCategory, deleteCategory, getCategory, getallCategory } = require("../controller/prodcategoryCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/', authMiddleWare, isAdmin, createCategory);
router.put('/:id', authMiddleWare, isAdmin, updateCategory);
router.delete('/:id', authMiddleWare, isAdmin, deleteCategory);
router.get('/:id', getCategory);
router.get('/', getallCategory);
//5:32:18
module.exports = router;