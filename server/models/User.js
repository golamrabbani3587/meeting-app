const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);
module.exports = User;