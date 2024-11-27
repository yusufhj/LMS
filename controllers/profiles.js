const express = require('express');
const router = express.Router();
const User = require('../models/user');

// allow signed in user to view their own profile only
router.get('/currentUser', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('Profile not found.');
        }
        res.json({ user });
    } catch (error) {
        if (res.statusCode === 404) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
  });

// allow all signed in users to view other users' profiles only for instructors
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404);
      throw new Error('Profile not found.');
    }
    // console.log(user.username)
    res.json({ user });
  } catch (error) {
    if (res.statusCode === 404) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;