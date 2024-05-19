const Post = require('../models/post');
const Comment = require('../models/comment');
const { isValidObjectId } = require('mongoose');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler

/**
 * Express middleware: set `req.mongoDbQuery` property, an object used to query
 * the MongoDB database, based on whether client provided an ID or slug in `req.params.id`
 * - e.g. if client provided an id: `{ _id: 661d8cf51c7292a1008ffb6a }`
 * - e.g. if client provided a slug: `{ slug: food }`
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validateIdParam = (req, res, next) => {
  // create MongoDB query obj based on request param
  req.mongoDbQuery = isValidObjectId(req.params.id)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  return next();
};

/**
 * Express middleware: throw error if `req.params.postId` doesn't belong to an existing Post.
 * Normalize `req.params.id` to a valid Post id.
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validatePostIdParam = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  // create MongoDB query obj based on request param
  const mongoDbPostQuery = isValidObjectId(postId)
    ? { _id: postId }
    : { slug: postId };

  // if invalid postId given: throw error
  const post = await Post.findOne(mongoDbPostQuery).exec();
  if (!post) return next(createError(404, `Post ${postId} not found`));

  // normalize postId to an id (not a slug)
  req.params.postId = post._id;
  return next();
});

/**
 * Express middleware: throw error if `req.params.commentId` doesn't belong to
 * an existing Comment. Set `req.mongoDbQuery` property, an object used to query
 * the MongoDB database, based on client-provided `postId` and `commentId`.
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validateCommentIdParam = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  // create MongoDB query obj based on request params
  req.mongoDbQuery = { _id: commentId, post: postId };

  const comment = await Comment.findOne(req.mongoDbQuery).exec();
  // if invalid commentId given: throw error
  if (!comment) return next(createError(404, `Comment ${commentId} not found`));

  return next();
});
