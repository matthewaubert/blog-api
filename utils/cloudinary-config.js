const cloudinary = require('cloudinary').v2; // https://cloudinary.com/documentation/node_quickstart

/**
 * upload image file to Cloudinary from given `imagePath`
 * @param {string} imagePath - local filepath to image || public URL to image
 * @returns {string} image `public_id` on Cloudinary
 */
module.exports.uploadImg = async (imagePath) => {
  const options = {
    use_filename: true, // sets the public ID to the filename of the uploaded file
    unique_filename: false, // doesn't apply random characters to the public ID to ensure uniqueness
    overwrite: true, // overwrites any image with the same public ID on upload
    folder: 'horizons',
  };

  try {
    // upload image
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result.public_id;
  } catch (error) {
    console.error(error);
  }
};

/**
 * delete image file at given `publicId` from Cloudinary
 * @param {string} publicId - image `public_id` on Cloudinary
 */
module.exports.deleteImg = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(error);
  }
};

/**
 * get image URL on Cloudinary
 * (review docs for `cloudinary.v2.url()` for more info)
 * @param {string} public_id - image `public_id` on Cloudinary
 * @param {object} options
 * @returns {string} image URL on Cloudinary
 */
module.exports.getImgUrl = cloudinary.url;
