const express = require("express");
const {
  createProducts,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addTowhishlist,
  rating
} = require("../controller/productCtrl");
const {isAdmin, authMiddleWare} = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/", authMiddleWare, isAdmin,  createProducts);
router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleWare, addTowhishlist);
router.put("/rating", authMiddleWare, rating);
router.put("/:id", authMiddleWare, isAdmin,  updateProduct);
router.delete("/:id", authMiddleWare, isAdmin,  deleteProduct);
router.get("/", getAllProduct);

module.exports = router;
