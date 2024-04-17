const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const { isValidObjectId } = require('mongoose');
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { body, validationResult } = require('express-validator'); // https://express-validator.github.io/docs
const { encode } = require('he'); // https://www.npmjs.com/package/he
const { slugify } = require('../utils/util');

// GET all Posts
exports.getAll = asyncHandler(async (req, res) => {
  // if client sorts by `id`, replace property name with `_id` to work with MongoDB
  if (req.query.sort && Object.keys(req.query.sort).includes('id')) {
    req.query.sort._id = req.query.sort.id;
    delete req.query.sort.id;
  }
  // console.log(req.query);

  // get all Posts
  const allPosts = await Post.find()
    // default sort by `_id` asc
    .sort(req.query.sort ? req.query.sort : { _id: 'asc' })
    .skip(req.query.offset)
    .limit(req.query.limit)
    .populate('user', 'firstName lastName username slug')
    .populate('category')
    .exec();

  res.json({
    message: 'Posts fetched from database',
    count: allPosts.length,
    data: allPosts,
  });
});

// GET a single Post
exports.getOne = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: GET a single Post' });
};

// validation & sanitization chain for Post POST & PUT
const validationChainPostPut = [
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .customSanitizer((value) => encode(value)),
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
  body('isPublished', 'Must be true or false').optional().isBoolean(),
  body('category')
    .optional()
    .trim()
    // check that `category` is a valid category id
    .custom(async (value) => {
      let isValid = true;

      if (!isValidObjectId(value)) isValid = false;
      const category = isValid ? await Category.findById(value).exec() : null;
      if (!category) isValid = false;

      if (!isValid) throw new Error(`Invalid category id: ${value}`);
    }),
  body('tags')
    .optional()
    // check that `tags` is an array of strings
    .isArray()
    .customSanitizer((values) => values.map((value) => encode(value))),
];

// POST (create) a new Post
exports.post = [
  // validate and sanitize Post fields
  ...validationChainPostPut,

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // create a Post object w/ escaped & trimmed data
    const post = new Post({
      title: req.body.title,
      slug: await slugify(req.body.title, 'post'),
      text: req.body.text,
      user: req.body.user,
      isPublished: req.body.isPublished,
      category: req.body.category,
      tags: req.body.tags,
      // TO DO: imgId (cover photo)
    });

    // if validation errors: send Post and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: post,
      });
    } else {
      // data from form is valid. Save Post and send back as JSON.
      await post.save();
      res.json({
        message: `Post '${post.title}' saved to database`,
        data: post,
      });
    }
  }),
];

// PUT (fully replace) a Post
exports.put = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: PUT (fully replace) a Post' });
};

// PATCH (partially update) a Post
exports.patch = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: PATCH (partially update) a Post' });
};

// DELETE a Post
exports.delete = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: DELETE a Post' });
};
