const express = require('express');
const User = require('../models/User');
const responses = require('../response');
const router = express.Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const distance = user.distance;
    console.log(responses[distance])

    // if (responses[distance]) {
      console.log('here')
      res.status(201).json({
        user,
        message: responses[distance].message,
        tips: responses[distance].tips,
        trainingPlan: responses[distance].trainingPlan,
      });
    // } else {
    //   res.status(201).json({ user, message: 'Distance not recognized' });
    // }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;