const express = require('express');
const User = require('../models/User');
// const responses = require('../response');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret_key';

const router = express.Router();

// Create a new user
// router.post('/users', async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     const distance = user.distance;
//     console.log(responses[distance])

//     // if (responses[distance]) {
//       console.log('here')
//       res.status(201).json({
//         user,
//         message: responses[distance].message,
//         tips: responses[distance].tips,
//         trainingPlan: responses[distance].trainingPlan,
//       });
//     // } else {
//     //   res.status(201).json({ user, message: 'Distance not recognized' });
//     // }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// Create a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, dob, distance, timeGoal, email, password } = req.body;
    const user = new User({ name, dob, distance, timeGoal, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;