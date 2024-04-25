const Category = require('../models/category');
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
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
    success: true,
    message: 'Categories fetched from database',
    count: allCategories.length,
    data: allCategories,
  });
});

// GET a single Category
exports.getOne = asyncHandler(async (req, res, next) => {
  // get Category w/ `_id` that matches `req.params.id`
  const category = await Category.findById(req.params.id).exec();

  // if Category not found: throw error
  if (!category) return next(createError(404, 'Category not found'));

  res.json({
    success: true,
    message: `Category '${category.name}' fetched from database`,
    data: category,
  });
});

// validation & sanitization chain for Category POST & PUT
const validationChainPostPut = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must not be empty.')
    // check that category name isn't already being used
    .custom(async (value, { req }) => {
      const category = await Category.findOne({ name: value }).exec();
      if (category && category.id !== req.params.id)
        throw Error('Category name already exists.');
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

  asyncHandler(async (req, res) => {
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
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: category,
      });
    } else {
      // data from form is valid. Save Category and send back as JSON.
      await category.save();

      res.json({
        success: true,
        message: `Category '${category.name}' saved to database`,
        data: category,
      });
    }
  }),
];

// PUT (fully replace) a Category
exports.put = [
  // validate and sanitize Category fields
  ...validationChainPostPut,

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    // create a Category object w/ escaped & trimmed data
    const category = new Category({
      name: req.body.name,
      slug: await slugify(req.body.name, 'category', req.params.id),
      description: req.body.description,
      _id: req.params.id, // this is required, or a new ID will be assigned!
    });

    // if validation errors: send Category and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: category,
      });
    } else {
      // data from form is valid. Save Category and send back as JSON.
      const updatedCategory = await Category.findOneAndReplace(
        { _id: req.params.id },
        category,
      );

      res.json({
        success: true,
        message: `Category '${updatedCategory.name}' replaced in database`,
        data: updatedCategory,
      });
    }
  }),
];

// PATCH (partially update) a Category
exports.patch = [
  // validate and sanitize Category fields
  body('name')
    .optional()
    .trim()
    // check that category name isn't already being used
    .custom(async (value, { req }) => {
      const category = await Category.findOne({ name: value }).exec();
      if (category && category.id !== req.params.id)
        throw Error('Category name already exists.');
    })
    .customSanitizer((value) => encode(value)),
  body('description')
    .optional()
    .trim()
    .customSanitizer((value) => encode(value)),

  asyncHandler(async (req, res) => {
    // extract validation errors from request
    const errors = validationResult(req);

    const categoryFields = {};
    const categorySchemaPaths = Object.keys(Category.schema.paths);

    // get category fields to update from body
    await Promise.all(
      // map each `req.body` key to a promise that resolves once the callback is finished
      Object.keys(req.body).map(async (field) => {
        // add field to categoryFields if non-empty and belongs to Category schema
        if (req.body[field] && categorySchemaPaths.includes(field)) {
          switch (field) {
            // if updating name, update slug as well
            case 'name':
              categoryFields.name = req.body.name;
              categoryFields.slug = await slugify(
                req.body.name,
                'category',
                req.params.id,
              );
              break;
            default:
              categoryFields[field] = req.body[field];
          }
        }
      }),
    );

    // console.log('categoryFields:', categoryFields);

    // if validation errors: send categoryFields and errors back as JSON
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: `${res.statusCode} Bad Request`,
        errors: errors.array(),
        data: categoryFields,
      });
    } else {
      // data from form is valid. Save Category and send back as JSON.
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        categoryFields,
        { new: true },
      ).exec();

      res.json({
        success: true,
        message: `Category '${category.name}' updated in database`,
        data: category,
      });
    }
  }),
];

// DELETE a Category
exports.delete = asyncHandler(async (req, res, next) => {
  // delete Category w/ `_id` that matches `req.params.id`
  const category = await Category.findByIdAndDelete(req.params.id).exec();

  // if Category not found: throw error
  if (!category) return next(createError(404, 'Category not found'));

  res.json({
    success: true,
    message: `Category '${category.name}' deleted from database`,
    data: category,
  });
});
