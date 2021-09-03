const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById, addOrderToUserHistory } = require("../controllers/user");
const {
  orderById,
  create,
  listOrders,
  getStatusValues,
  updateOrderStatus,
} = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");

router.post(
  "/order/create/:userId",
  requireSignin,
  isAuth,
  addOrderToUserHistory, // middleware to add order to user history
  decreaseQuantity, // middleware to decrease product qty and increase product sold
  create
);

// Get all the orders
router.get("/order/list/:userId", requireSignin, isAuth, isAdmin, listOrders);
router.get(
  "/order/status-values/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  getStatusValues
);
router.put(
  "/order/:orderId/status/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  updateOrderStatus
);

router.param("orderId", orderById);
router.param("userId", userById);

module.exports = router;
