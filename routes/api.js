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

// limit results?
// sort results?

// GET a single User
router.get('/users/:id', userController.getOne);

// POST (create) a new User
router.post('/users', userController.post);

// PUT (fully replace) a User
router.put('/users/:id', userController.put);

// DELETE a User
router.delete('/users/:id', userController.delete);

/* Post Routes */

// GET all Posts
router.get('/posts', postController.getAll);

// limit results?
// sort results?

// GET a single Post
router.get('/posts/:id', postController.getOne);

// POST (create) a new Post
router.post('/posts', postController.post);

// PUT (update) a Post
router.put('/posts/:id', postController.put);

// DELETE a Post
router.delete('/posts/:id', postController.delete);

/* Comment Routes */

// GET all Comments
router.get('/comments', commentController.getAll);

// limit results?
// sort results?

// GET a single Comment
router.get('/comments/:id', commentController.getOne);

// POST (create) a new Comment
router.post('/comments', commentController.post);

// PUT (update) a Comment
router.put('/comments/:id', commentController.put);

// DELETE a Comment
router.delete('/comments/:id', commentController.delete);

/* Category Routes */

// GET all Categories
router.get('/categories', categoryController.getAll);

// limit results?
// sort results?

// GET a single Category
router.get('/categories/:id', categoryController.getOne);

// POST (create) a new Category
router.post('/categories', categoryController.post);

// PUT (update) a Category
router.put('/categories/:id', categoryController.put);

// DELETE a Category
router.delete('/categories/:id', categoryController.delete);

module.exports = router;
