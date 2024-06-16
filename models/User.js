const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  distance: { type: String, required: true },
  timeGoal: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;