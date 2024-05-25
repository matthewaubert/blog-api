const { Router } = require('express');
const router = Router();
const {
  verifyToken,
  isVerified,
  isAdmin,
  isCorrectUser,
  isPostAuthor,
  isCommentAuthor,
} = require('../utils/auth-middleware');
const {
  validateIdParam,
  validateCommentIdParam,
  validatePostIdParam,
} = require('../utils/middleware');

const userController = require('../controllers/user-controller');
const postController = require('../controllers/post-controller');
const commentController = require('../controllers/comment-controller');
const categoryController = require('../controllers/category-controller');
const loginController = require('../controllers/login-controller');
const verificationController = require('../controllers/verification-controller');

// API index
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the API',
  });
});

/* User Routes */

// GET all Users
router.get('/users', verifyToken, isAdmin, userController.getAll);

// GET a single User by id or slug
router.get(
  '/users/:id',
  verifyToken,
  validateIdParam,
  isCorrectUser,
  userController.getOne,
);

// POST (create) a new User
router.post('/users', userController.post);

// PUT (fully replace) a User by id or slug
router.put(
  '/users/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  userController.put,
);

// PATCH (partially update) a User by id or slug
router.patch(
  '/users/:id',
  verifyToken,
  validateIdParam,
  isCorrectUser,
  userController.patch,
);

// DELETE a User by id or slug
router.delete(
  '/users/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  userController.delete,
);

/* Post Routes */

// GET all Posts
router.get('/posts', postController.getAll);

// GET a single Post by id or slug
router.get('/posts/:id', validateIdParam, postController.getOne);

// POST (create) a new Post
router.post('/posts', verifyToken, isVerified, postController.post);

// PUT (fully replace) a Post by id or slug
router.put(
  '/posts/:id',
  verifyToken,
  validateIdParam,
  isPostAuthor,
  postController.put,
);

// PATCH (partially update) a Post by id or slug
router.patch(
  '/posts/:id',
  verifyToken,
  validateIdParam,
  isPostAuthor,
  postController.patch,
);

// DELETE a Post by id or slug
router.delete(
  '/posts/:id',
  verifyToken,
  validateIdParam,
  isPostAuthor,
  postController.delete,
);

/* Comment Routes */

// GET all Comments
router.get(
  '/posts/:postId/comments',
  validatePostIdParam,
  commentController.getAll,
);

// GET a single Comment by id
router.get(
  '/posts/:postId/comments/:commentId',
  validatePostIdParam,
  validateCommentIdParam,
  commentController.getOne,
);

// POST (create) a new Comment
router.post(
  '/posts/:postId/comments',
  verifyToken,
  validatePostIdParam,
  commentController.post,
);

// PUT (fully replace) a Comment by id
router.put(
  '/posts/:postId/comments/:commentId',
  verifyToken,
  validatePostIdParam,
  validateCommentIdParam,
  isCommentAuthor,
  commentController.put,
);

// PATCH (partially update) a Comment by id
router.patch(
  '/posts/:postId/comments/:commentId',
  verifyToken,
  validatePostIdParam,
  validateCommentIdParam,
  isCommentAuthor,
  commentController.patch,
);

// DELETE a Comment by id
router.delete(
  '/posts/:postId/comments/:commentId',
  verifyToken,
  validatePostIdParam,
  validateCommentIdParam,
  isCommentAuthor,
  commentController.delete,
);

/* Category Routes */

// GET all Categories
router.get('/categories', categoryController.getAll);

// GET a single Category by id or slug
router.get('/categories/:id', validateIdParam, categoryController.getOne);

// POST (create) a new Category
router.post('/categories', verifyToken, isVerified, categoryController.post);

// PUT (fully replace) a Category by id or slug
router.put(
  '/categories/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  categoryController.put,
);

// PATCH (partially update) a Category by id or slug
router.patch(
  '/categories/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  categoryController.patch,
);

// DELETE a Category by id or slug
router.delete(
  '/categories/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  categoryController.delete,
);

/* Login Routes */

// POST login
router.post('/login', loginController.post);

/* Verify Email Routes */

// POST email verification (trigger sending an email)
router.post('/verification', verifyToken, verificationController.post);

// PATCH email verification (update `isVerified`)
router.patch('/verification', verificationController.patch);

module.exports = router;
