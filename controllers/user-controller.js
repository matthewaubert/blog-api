const User = require('../models/user');
const { isValidObjectId } = require('mongoose');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { slugify } = require('../utils/util');

// GET all Users
exports.getAll = asyncHandler(async (req, res) => {
  // get all Users
  const allUsers = await User.find().sort({ email: 1 }).exec();

  res.json({
    message: 'All users fetched from database',
    data: allUsers,
  });
});

// limit results?
// sort results?

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

// POST (create) a new User
exports.post = [
  // validate and sanitize User fields

  asyncHandler(async (req, res) => {
    console.log('req.body:', req.body);
    // extract validation errors from request

    // generate encrypted password w/ bcrypt

    // create a User object w/ escaped & trimmed data
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      slug: await slugify(req.body.username, 'user'),
      email: req.body.email,
      password: req.body.password, // need to hash this
    });

    // if errors: send user and errors back as JSON?

    // data from form is valid. Save User and send back as JSON.
    await user.save();
    res.json(user);
  }),
];

// PUT (update) a User
exports.put = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: PUT (update) a User' });
};

// DELETE a User
exports.delete = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: DELETE a User' });
};
