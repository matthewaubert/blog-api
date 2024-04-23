const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 100 },
  lastName: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true, maxLength: 100, unique: true },
  slug: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 100,
    unique: true,
  },
  password: { type: String, required: true, minLength: 8, maxLength: 100 },
  isVerified: { type: Boolean, required: true, default: false }, // whether User has been verified
  isAdmin: { type: Boolean, required: true, default: false },
});

// virtual for User's full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
