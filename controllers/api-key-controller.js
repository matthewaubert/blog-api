// GET TinyMCE API key for client side
exports.tinymceGet = (req, res) => {
  res.json({
    success: true,
    message: 'TinyMCE API key fetched.',
    data: process.env.TINYMCE_API_KEY,
  });
};
