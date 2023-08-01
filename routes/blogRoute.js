const express = require("express");
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog } = require("../controller/blogCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/', authMiddleWare, isAdmin,  createBlog);
router.put('/likes', authMiddleWare, likeBlog);
router.put('/dislikes', authMiddleWare, dislikeBlog);
router.put('/:id', authMiddleWare, isAdmin,  updateBlog);
router.get('/:id', getBlog);
router.get('/', getAllBlog);
router.delete('/:id', deleteBlog);


module.exports = router;