const jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken#readme
const limax = require('limax'); // https://github.com/lovell/limax

/**
 * create and return a JSON web token (JWT)
 * @param {object} user - JWT payload
 * @returns {string} JWT
 */
exports.issueJwt = (user) =>
  jwt.sign(
    { user }, // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: '24h' }, // options
  );

/**
 * convert input string to unique URL-friendly format,
 * in which any special characters are removed and spaces are replaced with hyphens
 * and numbers are appended to non-unique titles
 * @param {string} str - string to be transformed to slug
 * @param {string} model - Mongoose Model to check for uniqueness
 * @param {string | number | undefined} id - optional; allow same slug if `existingPost.id` matches `id`
 * @returns {Promise<string>}
 * e.g. 'The Quick Brown Fox Jumps Over The Lazy Dog! ' => 'the-quick-brown-fox-jumps-over-the-lazy-dog'
 * e.g. 'söme stüff with áccènts' => 'some-stuff-with-accents'
 * e.g. 'söme stüff with áccènts' => 'some-stuff-with-accents-1'
 */
exports.slugify = async (str, model, id) => {
  const slug = limax(str);
  let uniqueSlug = slug;

  try {
    // require correct model
    const Model = require(`../models/${model}`); // eslint-disable-line

    // check for uniqueness
    let existingPost = await Model.findOne({ slug: uniqueSlug });
    let count = 1;
    // if `id` arg supplied: allow same slug if `existingPost.id` matches `id`
    while (id ? existingPost && existingPost.id !== id : existingPost) {
      uniqueSlug = `${slug}-${count}`;
      existingPost = await Model.findOne({ slug: uniqueSlug }); // eslint-disable-line no-await-in-loop
      count++;
    }
  } catch (err) {
    console.error(err);
  }

  // console.log(uniqueSlug);
  return uniqueSlug;
};
