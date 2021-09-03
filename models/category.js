const mongoose = require("mongoose");

// Create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true,
    },
  },
  { timestamps: true }
);

// mongoose.model to create a new model
// We can use category model later in the project
module.exports = mongoose.model("Category", categorySchema);
