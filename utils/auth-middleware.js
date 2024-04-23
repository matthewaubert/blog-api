const Post = require('../models/post');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken#readme
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler

// verify JSON web token (JWT)
// FORMAT OF TOKEN: `Authorization: Bearer <access_token>`
exports.verifyToken = (req, res, next) => {
  // get auth header value
  const authHeader = req.headers.authorization;

  // if no authHeader: forbidden
  if (typeof authHeader === 'undefined')
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });

  // if bearer is not undefined: get token
  // eslint-disable-next-line prefer-destructuring
  const token = authHeader.split(' ')[1];
  // console.log('token', token);

  jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
    // if err: forbidden
    if (err)
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: err,
      });

    // if no error: set authData
    req.authData = authData;
    next();
  });
};

// ensure that authenticated user has been verified
exports.isVerified = (req, res, next) => {
  req.authData.user.isAdmin || req.authData.user.isVerified
    ? next()
    : res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
};

// ensure that authenticated user is an admin
exports.isAdmin = (req, res, next) => {
  req.authData.user.isAdmin
    ? next()
    : res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
};

// ensure that authenticated user's id is same as `req.params.id`
exports.isCorrectUser = (req, res, next) => {
  req.authData.user.isAdmin || req.authData.user._id === req.params.id
    ? next()
    : res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
};

// ensure that post belongs to authenticated user
exports.isPostAuthor = asyncHandler(async (req, res, next) => {
  if (req.authData.user.isAdmin) return next();

  const post = await Post.findById(req.params.id, 'user').exec();

  req.authData.user._id === post.user.toString()
    ? next()
    : res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
});

// ensure that comment belongs to authenticated user
exports.isCommentAuthor = asyncHandler(async (req, res, next) => {
  if (req.authData.user.isAdmin) return next();

  const comment = await Comment.findById(req.params.id, 'user').exec();

  req.authData.user._id === comment.user.toString()
    ? next()
    : res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
});
