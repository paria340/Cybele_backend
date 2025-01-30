const express = require('express');
const User = require('../models/User');
const responses = require('../response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret_key';
const { PythonShell } = require('python-shell');

// const RecommendationModel = require('../models/RecommendationModel'); // Import AI Model

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

// // Login a user
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid email or password' });
//     }

//     // Compare the provided password with the stored hashed password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid email or password' });
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

//     res.status(200).json({ token, user });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
function getRecommendations(userData) {
  return new Promise((resolve, reject) => {
    PythonShell.run(
      'predict.py', // Path to your Python script
      { args: [JSON.stringify(userData)] },
      (err, results) => {
        if (err) return reject(err);
        resolve(JSON.parse(results[0])); // Parse Python script response
      }
    );
  });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

    // Prepare user data for prediction
    const userData = {
      age: user.age,
      childish_diseases: user.childish_diseases, // 0 or 1
      trauma: user.trauma, // 0 or 1
      surgical_intervention: user.surgical_intervention, // 0 or 1
      high_fevers: user.high_fevers, // 0 or 1
      alcohol_frequency: user.alcohol_frequency, // 0-3
      smoking_habit: user.smoking_habit, // 0-2
      hours_sitting: user.hours_sitting, // numeric
    };

    // Fetch AI recommendations
    const recommendations = await getRecommendations(userData);

    res.status(200).json({
      token,
      user,
      recommendations, // Include AI predictions in the response
    });
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
      // const recommendations = await RecommendationModel.generateRecommendations(user);

      res.status(200).json({
        user,
        message: responses[distance].message,
        tips: responses[distance].tips,
        trainingPlan: responses[distance].trainingPlan,
        // recommendations,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;