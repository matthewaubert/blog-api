const Comment = require('../models/comment');
const User = require('../models/user');
const { isValidObjectId } = require('mongoose');
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { body, validationResult } = require('express-validator'); // https://express-validator.github.io/docs
const { encode } = require('he'); // https://www.npmjs.com/package/he

// GET all Comments
exports.getAll = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: GET all Comments' });
};

// GET a single Comment
exports.getOne = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: GET a single Comment' });
};

// validation & sanitization chain for Comment POST & PUT
const validationChainPostPut = [
  body('text', 'Text must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .customSanitizer((value) => encode(value)),
  // check that `user` is a valid user id
  body('user')
    .trim()
    .custom(async (value) => {
      let isValid = true;

      if (!isValidObjectId(value)) isValid = false;
      const user = isValid ? await User.findById(value).exec() : null;
      if (!user) isValid = false;

      if (!isValid) throw new Error(`Invalid user id: ${value}`);
    }),
];

// POST (create) a new Comment
exports.post = [
  // validate and sanitize Comment fields
  ...validationChainPostPut,

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // create a Comment object w/ escaped & trimmed data
    const comment = new Comment({
      text: req.body.text,
      user: req.body.user,
      post: req.params.postId,
    });

    // if validation errors: send Comment and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: comment,
      });
    } else {
      // data from form is valid. Save Comment and send back as JSON.
      await comment.save();
      res.json({
        message: 'Comment saved to database',
        data: comment,
      });
    }
  }),
];

// PUT (fully replace) a Comment
exports.put = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: PUT (fully replace) a Comment' });
};

// PATCH (partially update) a Comment
exports.patch = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: PATCH (partially update) a Comment' });
};

// DELETE a Comment
exports.delete = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: DELETE a Comment' });
};
