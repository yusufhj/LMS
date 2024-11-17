const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const user = {
  _id: 1,
  username: 'test',
  password: 'test',
};

router.get('/sign-token', (req, res) => {
    const token = jwt.sign({ user }, process.env.JWT_SECRET);
    res.json({ token });
});

router.post('/verify-token', (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ decoded });
        // res.json({ token });
        // res.json({ message: 'Token is valid.' });
        
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token.' });
    }
});

module.exports = router;