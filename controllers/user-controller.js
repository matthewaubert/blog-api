const User = require('../models/user');
const { isValidObjectId } = require('mongoose');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { body, validationResult } = require('express-validator'); // https://express-validator.github.io/docs
const { encode } = require('he'); // https://www.npmjs.com/package/he
const bcrypt = require('bcryptjs'); // https://www.npmjs.com/package/bcryptjs
const { slugify } = require('../utils/util');

// GET all Users
exports.getAll = asyncHandler(async (req, res) => {
  // if client sorts by `id`, replace property name with `_id` to work with MongoDB
  if (req.query.sort && Object.keys(req.query.sort).includes('id')) {
    req.query.sort._id = req.query.sort.id;
    delete req.query.sort.id;
  }
  // console.log(req.query);

  // get all Users
  const allUsers = await User.find()
    // default sort by `_id` asc
    .sort(req.query.sort ? req.query.sort : { _id: 'asc' })
    .skip(req.query.offset)
    .limit(req.query.limit)
    .exec();

  res.json({
    message: 'Users fetched from database',
    count: allUsers.length,
    data: allUsers,
  });
});

// GET a single User
exports.getOne = asyncHandler(async (req, res, next) => {
  // if invalid User id given: throw error
  if (!isValidObjectId(req.params.id))
    return next(createError(404, `Invalid user id: ${req.params.id}`));

  // get User w/ `id` that matches `req.params.id`
  const user = await User.findById(req.params.id).exec();

  // if User not found: throw error
  if (!user) return next(createError(404, 'User not found'));

  res.json({
    message: `User ${user.username} fetched from database`,
    data: user,
  });
});

// validation & sanitization chain for User POST & PUT
const validationChainPostPut = [
  body('firstName', 'First name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .customSanitizer((value) => encode(value)),
  body('lastName', 'Last name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .customSanitizer((value) => encode(value)),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username must not be empty')
    // check that username isn't already being used
    .custom(async (value) => {
      const user = await User.findOne({ username: value }).exec();
      if (user) throw new Error('Username already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('email')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Email must be at least 6 characters.')
    // check that email isn't already being used
    .custom(async (value) => {
      const user = await User.findOne({ email: value }).exec();
      if (user) throw new Error('Email already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('password', 'Password must be at least 8 characters.')
    .trim()
    .isLength({ min: 8 }),
  body('confirmPassword', 'Password confirmation must match password.')
    .trim()
    // check that password confirmation matches password
    .custom((value, { req }) => value === req.body.password),
];

// POST (create) a new User
exports.post = [
  // validate and sanitize User fields
  ...validationChainPostPut,

  asyncHandler(async (req, res, next) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // hash password w/ bcrypt
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      // if err, skip to next in middleware chain
      if (err) return next(err);

      // create a User object w/ escaped & trimmed data
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        slug: await slugify(req.body.username, 'user'),
        email: req.body.email,
        password: hashedPassword,
      });

      // if validation errors: send User and errors back as JSON
      if (!errors.isEmpty()) {
        res.status(400).json({
          message: `${res.statusCode} Bad Request`,
          errors: errors.array(),
          data: user,
        });
      } else {
        // data from form is valid. Save User and send back as JSON.
        await user.save();
        res.json({
          message: `User ${user.username} saved to database`,
          data: user,
        });
      }
    });
  }),
];

// PUT (fully replace) a User
exports.put = [
  asyncHandler(async (req, res, next) => {
    // if invalid User id given: throw error
    if (!isValidObjectId(req.params.id))
      return next(createError(404, `Invalid user id: ${req.params.id}`));

    return next();
  }),

  // validate and sanitize User fields
  ...validationChainPostPut,
  // validate old password matches one in database
  body('oldPassword', 'Incorrect old password')
    .trim()
    // check that `oldPassword` matches password in database
    .custom(async (value, { req }) => {
      const user = await User.findById(req.params.id).exec();
      const matches = user ? await bcrypt.compare(value, user.password) : false;
      if (!matches) throw new Error('Incorrect old password');
    }),

  asyncHandler(async (req, res, next) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // hash password w/ bcrypt
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      // if err, skip to next in middleware chain
      if (err) return next(err);

      // create a User object w/ escaped & trimmed data
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        slug: await slugify(req.body.username, 'user'),
        email: req.body.email,
        password: hashedPassword,
        _id: req.params.id, // this is required, or a new ID will be assigned!
      });

      // if validation errors: send User and errors back as JSON
      if (!errors.isEmpty()) {
        res.status(400).json({
          message: `${res.statusCode} Bad Request`,
          errors: errors.array(),
          data: user,
        });
      } else {
        // data from form is valid. Save User and send back as JSON.
        await User.findByIdAndUpdate(req.params.id, user);
        res.json({
          message: `User ${user.username} replaced in database`,
          data: user,
        });
      }
    });
  }),
];

// PATCH (partially update) a User
exports.patch = [
  asyncHandler(async (req, res, next) => {
    // if invalid User id given: throw error
    if (!isValidObjectId(req.params.id))
      return next(createError(404, `Invalid user id: ${req.params.id}`));

    return next();
  }),

  // validate and sanitize User fields
  body('firstName')
    .trim()
    .customSanitizer((value) => encode(value)),
  body('lastName')
    .trim()
    .customSanitizer((value) => encode(value)),
  body('username')
    .trim()
    // check that username isn't already being used
    .custom(async (value) => {
      const user = await User.findOne({ username: value }).exec();
      if (user) throw new Error('Username already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('email')
    .trim()
    // check that email, if exists, is at least 6 chars
    .custom((value) => value.length === 0 || value.length >= 6)
    // check that email isn't already being used
    .custom(async (value) => {
      const user = await User.findOne({ email: value }).exec();
      if (user) throw new Error('Email already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('password').trim(),
  body('confirmPassword', 'Password confirmation must match password.')
    .trim()
    // check that password confirmation matches password
    .custom((value, { req }) => value === req.body.password),
  body('oldPassword')
    .trim()
    // check that `oldPassword` matches password in database
    .custom(async (value, { req }) => {
      const user = await User.findById(req.params.id).exec();
      const matches = user ? await bcrypt.compare(value, user.password) : false;
      if (!matches) throw new Error('Incorrect old password');
    }),

  asyncHandler(async (req, res, next) => {
    // extract validation errors from request
    const errors = validationResult(req);

    const userFields = {};
    const userSchemaPaths = Object.keys(User.schema.paths);

    // get user fields to update from body
    await Promise.all(
      // map each `req.body` key to a promise that resolves once the callback is finished
      Object.keys(req.body).map(async (field) => {
        // add field to userFields if non-empty and belongs to User schema
        if (req.body[field] && userSchemaPaths.includes(field)) {
          switch (field) {
            // if updating username, update slug as well
            case 'username':
              userFields.username = req.body.username;
              userFields.slug = await slugify(req.body.username, 'user');
              break;
            // if updating password, use hash
            case 'password':
              userFields.password = await bcrypt.hash(req.body.password, 10);
              break;
            default:
              userFields[field] = req.body[field];
          }
        }
      }),
    );

    // console.log('userFields:', userFields);

    // if validation errors: send userFields and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: userFields,
      });
    } else {
      // data from form is valid. Save User and send back as JSON.
      const user = await User.findByIdAndUpdate(req.params.id, userFields, {
        new: true,
      }).exec();
      res.json({
        message: `User ${user.username} updated in database`,
        data: user,
      });
    }
  }),
];

// DELETE a User
exports.delete = asyncHandler(async (req, res, next) => {
  // if invalid User id given: throw error
  if (!isValidObjectId(req.params.id))
    return next(createError(404, `Invalid user id: ${req.params.id}`));

  // get User w/ `_id` that matches `req.params.id`
  const user = await User.findByIdAndDelete(req.params.id).exec();

  // if User not found: throw error
  if (!user) return next(createError(404, 'User not found'));

  res.json({
    message: `User ${user.username} deleted from database`,
    data: user,
  });
});
