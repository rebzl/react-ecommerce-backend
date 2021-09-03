const express = require('express');

const router = express.Router();

// Method to creare de category
const {
  categoryById,
  create,
  read,
  update,
  remove,
  list,
} = require('../controllers/category');
const { requireSignin, isAdmin, isAuth } = require('../controllers/auth'); // Methods to verify if the user is logged in
const { userById } = require('../controllers/user'); // Methods to verify if user is normal or admin

router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/category/:categoryId', read);
router.put(
  '/category/:categoryId/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  update
);
router.delete(
  '/category/:categoryId/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  remove
);
router.get('/categories', list);

// Everytime there is a userId in the url, the userById (located in controllers/user) will be executed.
// And make use of it information in the request object.
router.param('userId', userById);
router.param('categoryId', categoryById);

module.exports = router;
