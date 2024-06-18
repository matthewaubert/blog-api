const multer = require('multer'); // https://github.com/expressjs/multer

const storage = multer.diskStorage({
  // set multer storage location
  destination: (req, file, cb) => {
    cb(null, './public/images/');
  },
  // create filename
  filename: (req, file, cb) => {
    // remove extension from filename (e.g. 'filename.jpg' => 'filename')
    // if that results in a falsy value, use original filename
    const filename =
      file.originalname.split('.').slice(0, -1).join('.') || file.originalname;
    // get extension from mimetype (e.g. 'image/jpeg' => 'jpeg')
    const extension = file.mimetype.split('/').pop();
    // e.g. filename: filename-1710463486885.jpeg
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

// configure multer with storage obj and image filter
// export `upload` function
module.exports.upload = multer({
  storage,
  // filter for images only
  fileFilter: (req, file, cb) => {
    // if `image` mimetype: return true; else: false
    file.mimetype.split('/')[0] === 'image' ? cb(null, true) : cb(null, false);
  },
});
