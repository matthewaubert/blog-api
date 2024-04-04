const limax = require('limax'); // https://github.com/lovell/limax

/**
 * convert input string to unique URL-friendly format,
 * in which any special characters are removed and spaces are replaced with hyphens
 * and numbers are appended to non-unique titles
 * @param {String} str - string to be transformed to slug
 * @param {String} model - Mongoose Model to check for uniqueness
 * @returns {Promise<string>}
 * e.g. 'The Quick Brown Fox Jumps Over The Lazy Dog! ' => 'the-quick-brown-fox-jumps-over-the-lazy-dog'
 * e.g. 'söme stüff with áccènts' => 'some-stuff-with-accents'
 * e.g. 'söme stüff with áccènts' => 'some-stuff-with-accents-1'
 */
exports.slugify = async (str, model) => {
  const slug = limax(str);
  let uniqueSlug = slug;
  
  try {
    // require correct model
    const Model = require(`../models/${model}`); // eslint-disable-line
    
    // check for uniqueness
    let existingPost = await Model.findOne({ slug: uniqueSlug });
    let count = 1;
    while (existingPost) {
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
