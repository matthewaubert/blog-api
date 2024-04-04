const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { slugify } = require('../utils/util');

// GET all Users
exports.getAll = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: GET all Users' });
};

// limit results?
// sort results?

// GET a single User
exports.getOne = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: GET a single User' });
};

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
