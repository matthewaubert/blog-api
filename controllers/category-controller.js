const Category = require('../models/category');
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { body, validationResult } = require('express-validator'); // https://express-validator.github.io/docs
const { encode } = require('he'); // https://www.npmjs.com/package/he
const { slugify } = require('../utils/util');

// GET all Categories
exports.getAll = asyncHandler(async (req, res) => {
  // if client sorts by `id`, replace property name with `_id` to work with MongoDB
  if (req.query.sort && Object.keys(req.query.sort).includes('id')) {
    req.query.sort._id = req.query.sort.id;
    delete req.query.sort.id;
  }
  // console.log(req.query);

  // get all Categories
  const allCategories = await Category.find()
    // default sort by `_id` asc
    .sort(req.query.sort ? req.query.sort : { _id: 'asc' })
    .skip(req.query.offset)
    .limit(req.query.limit)
    .exec();

  res.json({
    message: 'Categories fetched from database',
    count: allCategories.length,
    data: allCategories,
  });
});

// GET a single Category
exports.getOne = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: GET a single Category' });
};

// validation & sanitization chain for Category POST & PUT
const validationChainPostPut = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must not be empty.')
    // check that category name isn't already being used
    .custom(async (value) => {
      const category = await Category.findOne({ name: value }).exec();
      if (category) throw Error('Category name already exists.');
    })
    .customSanitizer((value) => encode(value)),
  body('description')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),
];

// POST (create) a new Category
exports.post = [
  // validate and sanitize Category fields
  ...validationChainPostPut,

  asyncHandler(async (req, res, next) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // create a Category object w/ escaped & trimmed data
    const category = new Category({
      name: req.body.name,
      slug: await slugify(req.body.name, 'category'),
      description: req.body.description,
    });

    // if validation errors: send Category and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: category,
      });
    } else {
      // data from form is valid. Save Category and send back as JSON.
      await category.save();
      res.json({
        message: `Category ${category.name} saved to database`,
        data: category,
      });
    }
  }),
];

// PUT (update) a Category
exports.put = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: PUT (update) a Category' });
};

// DELETE a Category
exports.delete = (req, res) => {
  res.json({ message: 'NOT IMPLEMENTED: DELETE a Category' });
};
