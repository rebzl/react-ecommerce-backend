const { errorHandler } = require("../helpers/dbErrorHandle");
const User = require("../models/user");
const { Order } = require("../models/order");

// id will come from the route parameter
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    // If there is no user with this id, return error message
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    // Else, the user it will be stored in the req.prfile
    req.profile = user;
    // Every middleware needs to hace a next() function
    next();
  });
};

/**
 * User see their own profile
 */
exports.read = (req, res) => {
  // Don't send the hashed_password and salt
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

/**
 * User update their own profile
 */
exports.update = (req, res) => {
  // Find the id and set the request body of that id
  // req.body = name with updated name, password with updated password, etc
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorize to perform this action",
        });
      }
      // Don't send the hashed_password and salt
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

/**
 * It is a middleware
 * It is used before the order creation
 * Once the order is created, the user already has the order in his history array
 * @param {*} req
 * @param {*} res
 * @param {*} next Call back
 */
exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach((item) => {
    // Add each item to the history array
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history",
        });
      }
      next();
    }
  );
};

/**
 * Get user purchase history, received when the order is created
 * @param {*} req
 * @param {*} res
 */
exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      return res.json(orders);
    });
};
