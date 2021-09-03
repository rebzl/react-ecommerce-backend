const express = require("express");

const router = express.Router();

// Product methods
const {
  create,
  productById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
} = require("../controllers/product");
const { requireSignin, isAdmin, isAuth } = require("../controllers/auth"); // Methods to verify if the user is logged in
const { userById } = require("../controllers/user"); // Methods to verify if user is normal or admin

// Create product, only with admin role
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
// Get single product
router.get("/product/:productId", read);
// Remove single product, only with admin role
router.delete(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);
router.put(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);
router.get("/products", list);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.post("/products/by/search", listBySearch);
router.get("/product/photo/:productId", photo); // Will act as a middleware
router.get("/products/search", listSearch);

// Everytime there is a userId in the url, the userById (located in controllers/user) will be executed.
// And make use of it information in the request object.
router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
