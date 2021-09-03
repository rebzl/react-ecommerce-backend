const { Order, CartItem } = require("../models/order");
const { errorHandle } = require("../helpers/dbErrorHandle");

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: err,
        });
      }
      req.order = order;
      next();
    });
};

/**
 * Create new order
 * @param {*} req
 * @param {*} res
 */
exports.create = (req, res) => {
  // console.log("CREATE ORDER ", req.body);

  // Create a new user variable to assign the information of the user
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((err, data) => {
    if (err) {
      return res.status(400).json({
        err: errorHandle(err),
      });
    }
    res.json(data);
  });
};

/**
 * Get all the orders for the admin
 * @param {*} req
 * @param {*} res
 */
exports.listOrders = (req, res) => {
  // Get all the orders
  Order.find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandle(err),
        });
      }
      res.json(orders);
    });
};

/**
 * Get enum status enum values from bd
 * Example: Not processed, Processing, Shipped, Delivered, Cancelled
 * @param {*} req
 * @param {*} res
 */
exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

/**
 * Update order status
 * @param {*} req
 * @param {*} res
 */
exports.updateOrderStatus = (req, res) => {
  console.log(req.body);
  console.log(req.order._id);
  Order.findOneAndUpdate(
    { _id: req.order._id },
    { $set: { status: req.body.status } },
    { new: true },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandle(err),
        });
      }
      res.json(order);
    }
  );
};
