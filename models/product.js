const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

// Create schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId, // Refer to the model category
      ref: 'Category', // Relationship from one model to another
      required: true,
    },
    quantity: {
      // if someone buy a product, will be subtracted from the quantity and added sold
      type: Number,
    },
    sold: {
      // if someone buy a product, will be subtracted from the quantity and added sold
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String, // png, jpg, etc
    },
    shipping: {
      required: false,
      type: Boolean,
    },
  },
  { timestamps: true }
);

// mongoose.model to create a new model
// We can use User model later in the project
module.exports = mongoose.model('Product', productSchema);
