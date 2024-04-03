const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 100, unique: true },
  slug: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Category', CategorySchema);
