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

// API index
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

/* User Routes */

// GET all Users
router.get('/users', verifyToken, isAdmin, userController.getAll);

// GET a single User
router.get(
  '/users/:id',
  verifyToken,
  validateIdParam,
  isCorrectUser,
  userController.getOne,
);

// POST (create) a new User
router.post('/users', userController.post);

// PUT (fully replace) a User
router.put(
  '/users/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  userController.put,
);

// PATCH (partially update) a User
router.patch(
  '/users/:id',
  verifyToken,
  validateIdParam,
  isCorrectUser,
  userController.patch,
);

// DELETE a User
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

// GET a single Post
router.get('/posts/:id', validateIdParam, postController.getOne);

// POST (create) a new Post
router.post('/posts', verifyToken, isVerified, postController.post);

// PUT (fully replace) a Post
router.put(
  '/posts/:id',
  verifyToken,
  validateIdParam,
  isPostAuthor,
  postController.put,
);

// PATCH (partially update) a Post
router.patch(
  '/posts/:id',
  verifyToken,
  validateIdParam,
  isPostAuthor,
  postController.patch,
);

// DELETE a Post
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

// GET a single Comment
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
  isVerified,
  validatePostIdParam,
  commentController.post,
);

// PUT (fully replace) a Comment
router.put(
  '/posts/:postId/comments/:commentId',
  verifyToken,
  validatePostIdParam,
  validateCommentIdParam,
  isCommentAuthor,
  commentController.put,
);

// PATCH (partially update) a Comment
router.patch(
  '/posts/:postId/comments/:commentId',
  verifyToken,
  validatePostIdParam,
  validateCommentIdParam,
  isCommentAuthor,
  commentController.patch,
);

// DELETE a Comment
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

// GET a single Category
router.get('/categories/:id', validateIdParam, categoryController.getOne);

// POST (create) a new Category
router.post('/categories', verifyToken, isVerified, categoryController.post);

// PUT (fully replace) a Category
router.put(
  '/categories/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  categoryController.put,
);

// PATCH (partially update) a Category
router.patch(
  '/categories/:id',
  verifyToken,
  isAdmin,
  validateIdParam,
  categoryController.patch,
);

// DELETE a Category
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

module.exports = router;
