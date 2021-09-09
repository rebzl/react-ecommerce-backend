const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs"); // Access to the file system
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandle");

// id comes from the route param, with the name of productId
// This function is to get single product or update and delete any product
// This function will be executed everytime there is a productId
exports.productById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: "Product not found",
                });
            }
            req.product = product;
            next();
        });
};

exports.create = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded",
            });
        }

        // Validate for all fields
        const {
            name,
            description,
            price,
            category,
            quantity,
            shipping,
        } = fields;
        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: "All fields are required.",
            });
        }

        // Create a new product
        // fields =  name, descriptions, price, etc.
        const product = new Product(fields);
        console.log("files.photo", files.photo);
        // Photo it is the name of the variable that comes from the frontend
        if (files.photo) {
            // 1kb = 100
            // 1mb = 1000000
            // Validate if photo size is bigger than 1mb
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1MB in size",
                });
            }

            // product.photo.data = field from the model schema
            // files.photo.path = field from the frontend
            // fs = browser file system
            product.photo.data = fs.readFileSync(files.photo.path);
            // product.photo.contentType = field from the model schema
            // files.photo.type = field from the frontend
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err), // custom method to display a friendly error message
                });
            }
            res.json(result);
        });
    });
};

// This function will be executed only if there is a productId
exports.read = (req, res) => {
    // Not going to load photo yet, because it is very heavy and affects performance
    // The product will get to the frontend very fast, because we are not sending the photos
    // Will create separate methods to return the photos
    // req.product = get from the method productById, where it is store the product json
    req.product.photo = undefined;
    return res.json(req.product);
};

// This function will be executed only if there is a productId
exports.remove = (req, res) => {
    // req.product = get from the method productById, where it is store the product json
    const { product } = req;
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err),
            });
        }
        res.json({
            message: "Product deleted succesfully",
        });
    });
};

// This function will be executed only if there is a productId
exports.update = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded",
            });
        }

        // Update existing product
        // req.product = get from the method productById, where it is store the product json
        let { product } = req;
        // Use lodash method = _
        // fields = updated fields, like name, description, etc
        product = _.extend(product, fields);

        // Photo it is the name of the variable that comes from the frontend
        if (files.photo) {
            // 1kb = 100
            // 1mb = 1000000
            // Validate if photo size is bigger than 1mb
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1MB in size",
                });
            }

            // product.photo.data = field from the model schema
            // files.photo.path = field from the frontend
            // fs = browser file system
            product.photo.data = fs.readFileSync(files.photo.path);
            // product.photo.contentType = field from the model schema
            // files.photo.type = field from the frontend
            product.photo.contentType = files.photo.type;
        }
        console.log(4);
        product.save((err, result) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: err, // custom method to display a friendly error message
                });
            }
            res.json(result);
        });
    });
};

/**
 * Return product to frontend base on sell and new arrival
 * Sort product base on sell and new arrivals
 *
 * If return product by
 * Sell = /products?sortBy=sold&order=desc&limit=4
 * New arrival = /products?sortBy=createdAt&order=desc&limit=4
 * The sortBy=sold or sortBy=createdAt, the sold and createdAt are keys from de bd
 *
 * If no param are send, then all product are returned
 */
exports.list = (req, res) => {
    // req.query = Are the values that follow after products?
    // In this case can be req.query.order, req.query.sortBy, req.query.limit
    // If there is a query called order, then return order, else return asc
    const order = req.query.order ? req.query.order : "asc";
    const sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;

    // Find all the products from de db
    Product.find()
        .select("-photo") // Don not send the photos to the FE yet because it is too heavy and can affect performance. Another method will be created for photos
        .populate("category") // Populate category, this only can be done if category in the product schema is from type: ObjectId, and make ref to Category model
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    message: "Products not found",
                });
            }
            res.json(products);
        });
};

/**
 * It will find the products based on the req product category
 * First, find the product category we are getting in the request
 * Other products that has the same category, will be returned
 */
exports.listRelated = (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    // Find all the products except the current product (it is passed throught param)
    // $ne: means not included in mongo db
    Product.find({ _id: { $ne: req.product }, category: req.product.category })
        .limit(limit)
        .populate("category", "_id name")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Product not found",
                });
            }
            res.json(products);
        });
};

/**
 * Functionality: Display all the categories that is been used by the products.
 * For example, if it is 4 categories, but only 2 is been used by products, it will only display 2.
 */
exports.listCategories = (req, res) => {
    // distinct() = Get all the categories that are use in the product
    Product.distinct("category", {}, (err, categories) => {
        if (err) {
            res.status(400).json({
                error: "Categories not found",
            });
        }
        res.json(categories);
    });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
exports.listBySearch = (req, res) => {
    const order = req.body.order ? req.body.order : "desc";
    const sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    const limit = req.body.limit ? parseInt(req.body.limit) : 100;
    const skip = parseInt(req.body.skip); // load more buttom, by default it will see like 6 or 10 products
    const findArgs = {}; // contain category id or price range, the filter values

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (const key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                // Price
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1],
                };
            } else {
                // Categories
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select("-photo") // Don't select photo
        .populate("category") // Populate category
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found",
                });
            }
            res.json({
                size: data.length, // To know how many products are there
                data,
            });
        });
};

/**
 * This function will be executed only if there is a productId
 * This will work as a middleware
 * Get product photos
 */
exports.photo = (req, res, next) => {
    // Check if there is a photo in the productSchema
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType); // png, jpg, etc
        return res.send(req.product.photo.data);
    }
    next();
};

/**
 * Use to get all the products base on a input search or category dropdown
 * @param {*} req
 * @param {*} res
 */
exports.listSearch = (req, res) => {
    // Create query object to hold search value and category value
    const query = {};
    // Assign search value to query.name
    if (req.query.search) {
        // "i" = doesn't matter if it is cap letter or lower case
        // regex and options = regular expresion with mongo
        // Save in query.name whatever cames from the FE, Regardless of capital or small letters
        query.name = { $regex: req.query.search, $options: "i" };
        // Assign category value to query.category
        // "All" = the value of all categories. Comes from the FE
        // Save in query.category the value selected in the FE
        if (req.query.category && req.query.category != "All") {
            query.category = req.query.category;
        }
        // Find the product based on query object with 2 properties
        // Search and category
        Product.find(query, (err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err),
                });
            }
            res.json(products);
        }).select("-photo"); // remove the photo
    }
};

/**
 * Once the user create an order, decrease the product quantity and increase product sold
 * @param {*} req
 * @param {*} res
 * @param {*} next Callback
 */
exports.decreaseQuantity = (req, res, next) => {
    let bulkOps = req.body.order.products.map((item) => {
        return {
            // updateOne = method from mongoose
            updateOne: {
                filter: { _id: item._id }, // Filter by product id
                // $in = include
                // Decrease product qty and Increase product sold
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    // bulkWrite = mongoose method
    Product.bulkWrite(bulkOps, {}, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: "Could not update product",
            });
        }
        next();
    });
};
