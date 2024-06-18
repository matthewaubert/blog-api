const { upload } = require('../utils/multer-config');
const cloudinary = require('../utils/cloudinary-config');
const { unlink } = require('node:fs');
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler

exports.post = [
  upload.single('image'), // set `req.file` value to image obj
  // e.g. req.file = {
  //   fieldname: 'image',
  //   originalname: 'osprey-exos-55.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: './public/images/',
  //   filename: 'osprey-exos-55-1710465472296.jpeg',
  //   path: 'public/images/osprey-exos-55-1710465472296.jpeg',
  //   size: 97273,
  // };
  asyncHandler(async (req, res) => {
    // console.log('req.file:', req.file);

    let imgId; // will be set to Cloudinary `public_id` or `null`
    // if user uploaded an image:
    if (req.file) {
      // upload file to Cloudinary and set `imgId` to Cloudinary `public_id`
      imgId = await cloudinary.uploadImg(req.file.path);
      // delete local image upload
      unlink(req.file.path, (err) => {
        if (err) console.error(err);
      });
    } else {
      // set `imgId` to null
      imgId = null;
    }

    // return Cloudinary url || null
    res.json({ location: imgId ? cloudinary.getImgUrl(imgId) : null });
  }),
];
