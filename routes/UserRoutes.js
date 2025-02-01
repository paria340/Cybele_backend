const express = require('express');
const User = require('../models/User');
const responses = require('../response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret_key';
const axios = require('axios');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const fertilityCsvPath = path.join(__dirname, '../models/FertilityModel.csv');

const router = express.Router();

const loadFertilityData = () => {
  return new Promise((resolve, reject) => {
    const fertilityData = [];
    fs.createReadStream(fertilityCsvPath)
      .pipe(csv())
      .on('data', (row) => fertilityData.push(row))
      .on('end', () => resolve(fertilityData))
      .on('error', (err) => reject(err));
  });
};

const generateRecommendations = (user, fertilityData) => {
  // Example logic: Filter data based on user's characteristics
  const recommendations = fertilityData.filter((entry) => {
    return (
      entry.Season === 'user.season' && 
      parseInt(entry.Age) === 12 &&
      entry.Diagnosis === 'Normal' // Example condition
    );
  });

  // Modify this with actual AI processing or ML model inference
  return recommendations.length
    ? recommendations
    : [{ message: 'No specific recommendations found' }];
};

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

router.post('/login', async (req, res) => {
  try {
    console.log('login 2')
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

    // Load fertility data
    const fertilityData = await loadFertilityData();
    // Generate recommendations
    const recommendations = generateRecommendations(user, fertilityData);
    console.log(recommendations);

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.status(200).json({
      token,
      user,
      recommendations: recommendations.length ? recommendations : 'No recommendations found',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user data and recommendations
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      console.log('user')
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

module.exports = router;