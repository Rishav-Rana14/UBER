
const {check, validationResult} = require('express-validator')

const validateUser = [
    
  check('firstName')
  .notEmpty().withMessage('First name is required').bail()
  .isLength({min: 3}).withMessage('First name must contain at least 3 letters.')
  .trim().escape(),

    check('lastName')
    .optional()
    .matches(/^[a-zA-Z]+$/).withMessage('Last name must contain only letters.')
    .trim().escape(),   

    check('email')
    .notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

    check('password')
    .notEmpty().withMessage('Password is required').bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array().map(error => error.msg).join("; ") });
        }
        next();
      }

]

module.exports = {validateUser}
