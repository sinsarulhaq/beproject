const express = require("express");
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog, uploadImages } = require("../controller/blogCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");

router.post('/', authMiddleWare, isAdmin,  createBlog);
router.put('/likes', authMiddleWare, likeBlog);
router.put("/upload/:id", authMiddleWare, isAdmin, uploadPhoto.array('images', 2), blogImgResize, uploadImages)
router.put('/dislikes', authMiddleWare, dislikeBlog);
router.put('/:id', authMiddleWare, isAdmin,  updateBlog);
router.get('/:id', getBlog);
router.get('/', getAllBlog);
router.delete('/:id', deleteBlog);


module.exports = router;