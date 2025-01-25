const express = require('express');
const User = require('../models/User');
const responses = require('../response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret_key';
const RecommendationModel = require('../models/RecommendationModel'); // Import AI Model

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, dob, distance, timeGoal, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user
    const user = new User({ name, dob, distance, timeGoal, email, password: hashedPassword });
    await user.save();

    // Generate a JWT token
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

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const distance = user.distance;
      res.status(200).json({
        user,
        message: responses[distance].message,
        tips: responses[distance].tips,
        trainingPlan: responses[distance].trainingPlan,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get user data and recommendations
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const distance = user.distance;

      // Fetch AI recommendations
      const recommendations = await RecommendationModel.generateRecommendations(user);

      res.status(200).json({
        user,
        message: responses[distance].message,
        tips: responses[distance].tips,
        trainingPlan: responses[distance].trainingPlan,
        recommendations,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;