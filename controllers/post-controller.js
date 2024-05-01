const Post = require('../models/post');
const Category = require('../models/category');
const { isValidObjectId } = require('mongoose');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
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
    success: true,
    message: 'Posts fetched from database',
    count: allPosts.length,
    data: allPosts,
  });
});

// GET a single Post
exports.getOne = asyncHandler(async (req, res, next) => {
  // get Post w/ `_id` that matches `req.params.id`
  const post = await Post.findById(req.params.id)
    .populate('user', 'firstName lastName username slug')
    .populate('category')
    .exec();

  // if Post not found: throw error
  if (!post) return next(createError(404, 'Post not found'));

  res.json({
    success: true,
    message: `Post '${post.title}' fetched from database`,
    data: post,
  });
});

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
      user: req.authData.user._id,
      isPublished: req.body.isPublished,
      category: req.body.category,
      tags: req.body.tags,
      // TO DO: imgId (cover photo)
    });

    // if validation errors: send Post and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: post,
      });
    } else {
      // data from form is valid. Save Post and send back as JSON.
      await post.save();

      res.json({
        success: true,
        message: `Post '${post.title}' saved to database`,
        data: post,
      });
    }
  }),
];

// PUT (fully replace) a Post
exports.put = [
  // validate and sanitize Post fields
  ...validationChainPostPut,

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // create a Post object w/ escaped & trimmed data
    const post = new Post({
      title: req.body.title,
      slug: await slugify(req.body.title, 'post', req.params.id),
      text: req.body.text,
      user: req.authData.user._id,
      isPublished: req.body.isPublished,
      category: req.body.category,
      tags: req.body.tags,
      // TO DO: imgId (cover photo)
      _id: req.params.id, // this is required, or a new ID will be assigned!
    });

    // if validation errors: send Post and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: post,
      });
    } else {
      // data from form is valid. Save Post and send back as JSON.
      const updatedPost = await Post.findOneAndReplace(
        { _id: req.params.id },
        post,
      );

      res.json({
        success: true,
        message: `Post '${updatedPost.title}' replaced in database`,
        data: updatedPost,
      });
    }
  }),
];

// PATCH (partially update) a Post
exports.patch = [
  // validate and sanitize Post fields
  body('title')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),
  body('text')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),
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

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    const postFields = {};
    const postSchemaPaths = Object.keys(Post.schema.paths);

    // get post fields to update from body
    await Promise.all(
      // map each `req.body` key to a promise that resolves once the callback is finished
      Object.keys(req.body).map(async (field) => {
        // add field to postFields if non-empty and belongs to Post schema
        if (req.body[field] && postSchemaPaths.includes(field)) {
          switch (field) {
            // if updating title, update slug as well
            case 'title':
              postFields.title = req.body.title;
              postFields.slug = await slugify(
                req.body.title,
                'post',
                req.params.id,
              );
              break;
            default:
              postFields[field] = req.body[field];
          }
        }
      }),
    );

    // if validation errors: send postFields and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: postFields,
      });
    } else {
      // data from form is valid. Save Post and send back as JSON.
      const post = await Post.findByIdAndUpdate(req.params.id, postFields, {
        new: true,
      }).exec();

      res.json({
        success: true,
        message: `Post '${post.title}' updated in database`,
        data: post,
      });
    }
  }),
];

// DELETE a Post
exports.delete = asyncHandler(async (req, res, next) => {
  // delete Post w/ `_id` that matches `req.params.id`
  const post = await Post.findByIdAndDelete(req.params.id)
    .populate('user', 'firstName lastName username slug')
    .populate('category')
    .exec();

  // if Post not found: throw error
  if (!post) return next(createError(404, 'Post not found'));

  res.json({
    success: true,
    message: `Post '${post.title}' deleted from database`,
    data: post,
  });
});
