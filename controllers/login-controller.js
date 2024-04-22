const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { issueJwt } = require('../utils/util');

// POST login
exports.post = asyncHandler(async (req, res) => {
  // check if there's a user with given email and password
  const user = await User.findOne({ email: req.body.email });
  const match = user
    ? await bcrypt.compare(req.body.password, user.password)
    : false;

  // console.log('user', user);
  // console.log('match', match);

  // if match: issue JWT
  if (match) {
    res.status(200).json({
      success: true,
      message: 'You are now authenticated',
      token: issueJwt(user),
    });
  } else {
    // no match: inform user
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
});
