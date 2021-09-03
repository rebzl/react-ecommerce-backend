const mongoose = require('mongoose');
const crypto = require('crypto');
// Generate unique ids
const { v1: uuidv1 } = require('uuid');
// Create schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    history: {
      // When a user purchase something from the shop, those puchases will be stored in history
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual field
// Encript password
userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encriptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Create methods with userSchema
userSchema.methods = {
  // method to signup
  encriptPassword(password) {
    console.log('password', password);
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
  // method to signin
  // param: password
  // retorna true can authenticate the user
  // retorna false not authenticate the user
  authenticate(plainText) {
    return this.encriptPassword(plainText) === this.hashed_password;
  },
};

// mongoose.model to create a new model
// We can use User model later in the project
module.exports = mongoose.model('User', userSchema);
