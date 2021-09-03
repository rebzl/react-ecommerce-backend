const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandle");

// id comes from the route param, with the name of categoryId
// This function is to get single category or update and delete any category
// This function will be executed everytime there is a categoryId
exports.categoryById = (req, res, next, id) => {
  console.log(id);
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "Category does not exist",
      });
    }
    req.category = category;
    next();
  });
};

exports.create = (req, res) => {
  const category = new Category(req.body);
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err), // custom method to display a friendly error message
      });
    }
    res.json({ data });
  });
};

// This function will be executed only if there is a categoryId
exports.read = (req, res) => res.json(req.category);

// This function will be executed only if there is a categoryId
exports.update = (req, res) => {
  // req.category = get from the method categoryById, where it is store the category json
  const { category } = req;
  category.name = req.body.name;
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Category not updated",
      });
    }
    res.json(data);
  });
};

// This function will be executed only if there is a categoryId
exports.remove = (req, res) => {
  // req.category = get from the method categoryById, where it is store the category json
  const { category } = req;
  category.remove((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Category deleted succesfully",
    });
  });
};

exports.list = (req, res) => {
  // find() = find all the categories
  Category.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};
