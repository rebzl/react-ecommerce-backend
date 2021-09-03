const express = require("express");

const router = express.Router();
const {
  signup,
  signin,
  signout,
  requireSignin,
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

// first will call the userSignupValidator and then the signup
router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// Temporary router for testing
// Example, make this hello router protecting only for signin user
// router.get("/hello", requireSignin, (req, res) => {
//   res.send("hello there");
// });

module.exports = router;
