const { Router } = require('express');
const router = Router();

const userController = require('../controllers/user-controller');
const postController = require('../controllers/post-controller');
const commentController = require('../controllers/comment-controller');
const categoryController = require('../controllers/category-controller');

// API index
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

/* User Routes */

// GET all Users
router.get('/users', userController.getAll);

// GET a single User
router.get('/users/:id', userController.getOne);

// POST (create) a new User
router.post('/users', userController.post);

// PUT (fully replace) a User
router.put('/users/:id', userController.put);

// PATCH (partially update) a User
router.patch('/users/:id', userController.patch);

// DELETE a User
router.delete('/users/:id', userController.delete);

/* Post Routes */

// GET all Posts
router.get('/posts', postController.getAll);

// GET a single Post
router.get('/posts/:id', postController.getOne);

// POST (create) a new Post
router.post('/posts', postController.post);

// PUT (fully replace) a Post
router.put('/posts/:id', postController.put);

// PATCH (partially update) a Post
router.patch('/posts/:id', postController.patch);

// DELETE a Post
router.delete('/posts/:id', postController.delete);

/* Comment Routes */

// GET all Comments
router.get('/comments', commentController.getAll);

// GET a single Comment
router.get('/comments/:id', commentController.getOne);

// POST (create) a new Comment
router.post('/comments', commentController.post);

// PUT (fully replace) a Comment
router.put('/comments/:id', commentController.put);

// PATCH (partially update) a Comment
router.patch('/comments/:id', commentController.patch);

// DELETE a Comment
router.delete('/comments/:id', commentController.delete);

/* Category Routes */

// GET all Categories
router.get('/categories', categoryController.getAll);

// GET a single Category
router.get('/categories/:id', categoryController.getOne);

// POST (create) a new Category
router.post('/categories', categoryController.post);

// PUT (fully replace) a Category
router.put('/categories/:id', categoryController.put);

// PATCH (partially update) a Category
router.patch('/categories/:id', categoryController.patch);

// DELETE a Category
router.delete('/categories/:id', categoryController.delete);

module.exports = router;
