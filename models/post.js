const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 100 },
    slug: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, required: true, default: false }, // whether Post has been published
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, lowercase: true }], // array of tags
    // imgId: { type: String }, // TO DO: cover photo
  },
  { timestamps: true }, // https://mongoosejs.com/docs/timestamps.html
);

module.exports = mongoose.model('Post', PostSchema);
