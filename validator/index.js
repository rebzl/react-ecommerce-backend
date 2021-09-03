// the userSignupValidator will be used in routes/auth
exports.userSignupValidator = (req, res, next) => {
  // .check() -> from express-validator
  console.log('req.body', req.body);
  req.check('name', 'Name is requiered').notEmpty();
  req
    .check('email', 'Email must be between 3 to 32 characters')
    .isEmail() // must be an email
    .withMessage('Email must contain @')
    .isLength({
      min: 4,
      max: 32,
    });
  req.check('password', 'Password is required').notEmpty();
  req
    .check('password')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/) // need to have at least one number (digit)
    .withMessage('Password must contain a number');
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // if error or success, it needs to move to the next stage
  next();
};
