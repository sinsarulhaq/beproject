const express = require("express");
const {
  createProducts,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addTowhishlist,
  rating,
  uploadImages,
} = require("../controller/productCtrl");
const {isAdmin, authMiddleWare} = require("../middlewares/authMiddleware")
const router = express.Router();

const { uploadPhoto, productImgResize, blogImgResize } = require("../middlewares/uploadImages");

router.post("/", authMiddleWare, isAdmin,  createProducts);
router.put("/upload/:id", authMiddleWare, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages)
router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleWare, addTowhishlist);
router.put("/rating", authMiddleWare, rating);
router.put("/:id", authMiddleWare, isAdmin,  updateProduct);
router.delete("/:id", authMiddleWare, isAdmin,  deleteProduct);
router.get("/", getAllProduct);

module.exports = router;
