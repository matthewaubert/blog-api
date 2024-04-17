const Post = require('../models/post');
const Comment = require('../models/comment');
const { isValidObjectId } = require('mongoose');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler

/**
 * Express middleware: throw error if `req.params.id` is an invalid MongoDB object id
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validateIdParam = (req, res, next) => {
  // if invalid id given: throw error
  if (!isValidObjectId(req.params.id))
    return next(createError(404, `Invalid id: ${req.params.id}`));

  return next();
};

/**
 * Express middleware: throw error if `req.params.commentId` is an invalid MongoDB object id
 * or given Comment doesn't belong to given Post
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validateCommentIdParam = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;
  let isValid = true;

  if (!isValidObjectId(commentId)) isValid = false;
  const comment = isValid
    ? await Comment.findOne({ _id: commentId, post: postId }).exec()
    : null;
  if (!comment) isValid = false;

  // if invalid commentId given: throw error
  if (!isValid) {
    return next(createError(404, `Invalid comment id: ${commentId}`));
  }
  return next();
});

/**
 * Express middleware: throw error if `req.params.postId` is an invalid MongoDB object id
 * or doesn't belong to an existing Post
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validatePostIdParam = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  let isValid = true;

  if (!isValidObjectId(postId)) isValid = false;
  const post = isValid ? await Post.findById(postId).exec() : null;
  if (!post) isValid = false;

  // if invalid postId given: throw error
  if (!isValid) {
    return next(createError(404, `Invalid post id: ${postId}`));
  }
  return next();
});
