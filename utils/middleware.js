const Post = require('../models/post');
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
 * @param {object} req - Express `request` object
 * @param {object} res - Express `response` object
 * @param {function} next - Express `next` function
 * @returns {undefined}
 */
exports.validateCommentIdParam = (req, res, next) => {
  // if invalid id given: throw error
  if (!isValidObjectId(req.params.commentId))
    return next(
      createError(404, `Invalid comment id: ${req.params.commentId}`),
    );

  return next();
};

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

  if (!isValid) {
    next(createError(404, `Invalid post id: ${postId}`));
  } else {
    return next();
  }
});
