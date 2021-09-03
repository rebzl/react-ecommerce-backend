const express = require("express");

const router = express.Router();
const {
  userById,
  read,
  update,
  purchaseHistory,
} = require("../controllers/user");

const { requireSignin, isAdmin, isAuth } = require("../controllers/auth");

// requireSignin -- verify if the user is loggded in
// isAuth -- verify that the information belongs to the user who is accessing it
// isAdmin -- verify if the user is an admin
// Test route
router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});
// User see their own profile
router.get("/user/:userId", requireSignin, isAuth, read);
// User update their own profile
router.put("/user/:userId", requireSignin, isAuth, update);
// Get user purchase history
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);

// Everytime there is a userId in the url, the userById (located in controllers/user) will be executed.
// And make use of it information in the request object.
router.param("userId", userById);

module.exports = router;
