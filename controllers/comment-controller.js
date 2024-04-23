const Comment = require('../models/comment');
const Post = require('../models/post');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { body, validationResult } = require('express-validator'); // https://express-validator.github.io/docs
const { encode } = require('he'); // https://www.npmjs.com/package/he

// GET all Comments
exports.getAll = asyncHandler(async (req, res) => {
  // if client sorts by `id`, replace property name with `_id` to work with MongoDB
  if (req.query.sort && Object.keys(req.query.sort).includes('id')) {
    req.query.sort._id = req.query.sort.id;
    delete req.query.sort.id;
  }
  // console.log(req.query);

  // get Post and all its Comments
  const [post, postComments] = await Promise.all([
    Post.findById(req.params.postId, 'title').exec(),
    Comment.find({ post: req.params.postId })
      // default sort by `_id` asc
      .sort(req.query.sort ? req.query.sort : { _id: 'asc' })
      .skip(req.query.offset)
      .limit(req.query.limit)
      .populate('user', 'firstName lastName username slug')
      .populate('post', 'title slug')
      .exec(),
  ]);

  res.json({
    message: `Comments from post '${post.title}' fetched from database`,
    count: postComments.length,
    data: postComments,
  });
});

// GET a single Comment
exports.getOne = asyncHandler(async (req, res, next) => {
  // get Comment w/ `_id` that matches `req.params.commentId`
  // and `post` that matches `req.params.postId`
  const comment = await Comment.findOne({
    _id: req.params.commentId,
    post: req.params.postId,
  })
    .populate('user', 'firstName lastName username slug')
    .populate('post', 'title slug')
    .exec();

  // if Comment not found: throw error
  if (!comment) return next(createError(404, 'Comment not found'));

  res.json({
    message: `Comment '${comment.id}' fetched from database`,
    data: comment,
  });
});

// validation & sanitization chain for Comment POST & PUT
const validationChainPostPut = [
  body('text', 'Text must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .customSanitizer((value) => encode(value)),
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
      user: req.authData.user._id,
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
        message: `Comment '${comment.id}' saved to database`,
        data: comment,
      });
    }
  }),
];

// PUT (fully replace) a Comment
exports.put = [
  // validate and sanitize Comment fields
  ...validationChainPostPut,

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // create a Comment object w/ escaped & trimmed data
    const comment = new Comment({
      text: req.body.text,
      user: req.authData.user._id,
      post: req.params.postId,
      _id: req.params.commentId, // this is required, or a new ID will be assigned!
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
      const updatedComment = await Comment.findOneAndReplace(
        { _id: req.params.commentId },
        comment,
      );
      res.json({
        message: `Comment '${updatedComment.id}' replaced in database`,
        data: updatedComment,
      });
    }
  }),
];

// PATCH (partially update) a Comment
exports.patch = [
  // validate and sanitize Comment fields
  body('text')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    const commentFields = {};
    const commentSchemaPaths = Object.keys(Comment.schema.paths);
    // console.log('commentSchemaPaths', commentSchemaPaths);

    // get comment fields to update from body
    await Promise.all(
      // map each `req.body` key to a promise that resolves once the callback is finished
      Object.keys(req.body).map(async (field) => {
        // add field to commentFields if non-empty and belongs to Comment schema
        if (req.body[field] && commentSchemaPaths.includes(field)) {
          commentFields[field] = req.body[field];
        }
      }),
    );

    // console.log('commentFields:', commentFields);

    // if validation errors: send commentFields and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: commentFields,
      });
    } else {
      // data from form is valid. Save Comment and send back as JSON.
      const comment = await Comment.findOneAndUpdate(
        { _id: req.params.commentId, post: req.params.postId }, // filter
        commentFields, // update
        { new: true }, // options
      ).exec();
      res.json({
        message: `Comment '${comment.id}' updated in database`,
        data: comment,
      });
    }
  }),
];

// DELETE a Comment
exports.delete = asyncHandler(async (req, res, next) => {
  // get Comment w/ `_id` that matches `req.params.commentId`
  // and `post` that matches `req.params.postId`
  const comment = await Comment.findOneAndDelete({
    _id: req.params.commentId,
    post: req.params.postId,
  })
    .populate('user', 'firstName lastName username slug')
    .populate('post', 'title slug')
    .exec();

  // if Comment not found: throw error
  if (!comment) return next(createError(404, 'Comment not found'));

  res.json({
    message: `Comment '${comment.id}' deleted from database`,
    data: comment,
  });
});
