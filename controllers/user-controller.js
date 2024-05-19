const User = require('../models/user');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { body, validationResult } = require('express-validator'); // https://express-validator.github.io/docs
const { encode } = require('he'); // https://www.npmjs.com/package/he
const bcrypt = require('bcryptjs'); // https://www.npmjs.com/package/bcryptjs
const { issueJwt, slugify } = require('../utils/util');

// GET all Users
exports.getAll = asyncHandler(async (req, res) => {
  // if client sorts by `id`, replace property name with `_id` to work with MongoDB
  if (req.query.sort && Object.keys(req.query.sort).includes('id')) {
    req.query.sort._id = req.query.sort.id;
    delete req.query.sort.id;
  }

  // get all Users
  const allUsers = await User.find()
    // default sort by `_id` asc
    .sort(req.query.sort ? req.query.sort : { _id: 'asc' })
    .skip(req.query.offset)
    .limit(req.query.limit)
    .exec();

  res.json({
    success: true,
    message: 'Users fetched from database',
    count: allUsers.length,
    data: allUsers,
  });
});

// GET a single User by id or slug
exports.getOne = asyncHandler(async (req, res, next) => {
  // get User w/ `_id` or `slug` that matches `req.params.id`
  // (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
  const user = await User.findOne(req.mongoDbQuery).exec();

  // if User not found: throw error
  if (!user) return next(createError(404, `User '${req.params.id}' not found`));

  res.json({
    success: true,
    message: `User '${user.username}' fetched from database`,
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
    .custom(async (value, { req }) => {
      const user = await User.findOne({ username: value }).exec();
      if (user && user.id !== req.params.id && user.slug !== req.params.id)
        throw new Error('Username already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('email')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Email must be at least 6 characters.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    // check that email isn't already being used
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value }).exec();
      if (user && user.id !== req.params.id && user.slug !== req.params.id)
        throw new Error('Email already in use.');
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
          success: false,
          message: `${res.statusCode} Bad Request`,
          errors: errors.array(),
          data: user,
        });
      } else {
        // data from form is valid. Save User and send back as JSON.
        await user.save();

        res.json({
          success: true,
          message: `User '${user.username}' saved to database`,
          data: user,
        });
      }
    });
  }),
];

// PUT (fully replace) a User by id or slug
exports.put = [
  // validate and sanitize User fields
  ...validationChainPostPut,
  // validate current password matches one in database
  body('currentPassword', 'Incorrect current password')
    .trim()
    // check that `currentPassword` matches password in database
    .custom(async (value, { req }) => {
      // (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
      const user = await User.findOne(req.mongoDbQuery, 'password').exec();
      const matches = user ? await bcrypt.compare(value, user.password) : false;
      if (!matches) throw new Error('Incorrect current password');
    }),

  asyncHandler(async (req, res, next) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // hash password w/ bcrypt
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      // if err, skip to next in middleware chain
      if (err) return next(err);

      // don't know whether client will provide id or slug, so need to ensure we have both
      // (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
      const oldUser = await User.findOne(req.mongoDbQuery, 'slug');

      // create a User object w/ escaped & trimmed data
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        slug: await slugify(req.body.username, 'user', oldUser.id),
        email: req.body.email,
        password: hashedPassword,
        _id: oldUser.id, // this is required, or a new ID will be assigned!
      });

      // if validation errors: send User and errors back as JSON
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: `${res.statusCode} Bad Request`,
          errors: errors.array(),
          data: user,
        });
      } else {
        // data from form is valid. Save User, issue new JWT, send both as JSON.
        const updatedUser = await User.findOneAndReplace(
          req.mongoDbQuery, // filter (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
          user, // replacement
          { returnDocument: 'after' }, // options
        ).exec();

        res.json({
          success: true,
          message: `User '${updatedUser.username}' replaced in database`,
          token: issueJwt(updatedUser),
          data: updatedUser,
        });
      }
    });
  }),
];

// PATCH (partially update) a User by id or slug
exports.patch = [
  // validate and sanitize User fields
  body('firstName')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),
  body('lastName')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),
  body('username')
    .optional()
    .trim()
    // check that username isn't already being used
    .custom(async (value, { req }) => {
      const user = await User.findOne({ username: value }).exec();
      if (user && user.id !== req.params.id && user.slug !== req.params.id)
        throw new Error('Username already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('email')
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage('Email must be at least 6 characters.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    // check that email isn't already being used
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value }).exec();
      if (user && user.id !== req.params.id && user.slug !== req.params.id)
        throw new Error('Email already in use.');
    })
    .customSanitizer((value) => encode(value)),
  body('password').optional().trim(),
  body('confirmPassword', 'Password confirmation must match password.')
    .trim()
    // check that password confirmation matches password
    .custom((value, { req }) => {
      if (req.body.password) {
        return value === req.body.password;
      }

      return true;
    }),
  body('currentPassword')
    .trim()
    // check that `currentPassword` matches password in database
    .custom(async (value, { req }) => {
      // (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
      const user = await User.findOne(req.mongoDbQuery, 'password').exec();
      const matches = user ? await bcrypt.compare(value, user.password) : false;
      if (!matches) throw new Error('Incorrect current password');
    }),

  asyncHandler(async (req, res, next) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // don't know whether client will provide id or slug, so need to ensure we have both
    // (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
    const oldUser = await User.findOne(req.mongoDbQuery, 'slug');

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
              userFields.slug = await slugify(
                req.body.username,
                'user',
                oldUser.id,
              );
              break;
            // if updating password, use hash
            case 'password':
              userFields.password = await bcrypt.hash(req.body.password, 10);
              break;
            // do not allow client to change admin status
            case 'isAdmin':
              return next(createError(403, 'Forbidden'));
            default:
              userFields[field] = req.body[field];
          }
        }
      }),
    );

    // if validation errors: send userFields and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: userFields,
      });
    } else {
      // data from form is valid. Save User, issue new JWT, send both as JSON.
      const user = await User.findOneAndUpdate(
        req.mongoDbQuery, // filter (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
        userFields, // update
        { new: true }, // options
      ).exec();

      res.json({
        success: true,
        message: `User '${user.username}' updated in database`,
        token: issueJwt(user),
        data: user,
      });
    }
  }),
];

// DELETE a User by id or slug
exports.delete = asyncHandler(async (req, res, next) => {
  // delete User w/ `_id` that matches `req.params.id`
  // (`req.mongoDbQuery` obj set in `validateIdParam` middleware)
  const user = await User.findOneAndDelete(req.mongoDbQuery).exec();

  // if User not found: throw error
  if (!user) return next(createError(404, `User '${req.params.id}' not found`));

  res.json({
    success: true,
    message: `User '${user.username}' deleted from database`,
    data: user,
  });
});
