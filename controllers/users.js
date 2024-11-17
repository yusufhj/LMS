const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', async (req, res) => {
    // POST {{host}}/users/signup
    try {
        const userInDB = await User.findOne({ username: req.body.username });
        if (userInDB) throw new Error('Username already taken.');

        // if there is no error, create a new user
        const user = await User.create({
            username: req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password, parseInt(process.env.SALT_ROUNDS)),
            role: req.body.role,
        });
        
        const token = jwt.sign(
            { username: user.username, _id: user._id, role: user.role }, 
            process.env.JWT_SECRET
        );

        res.status(201).json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Something Went Wrong!' });
    }
    // res.json({ message: 'Signup route' });
});

router.post('/signin', async (req, res) => {
    try {
        // find user
        const user = await User.findOne({ username: req.body.username });

        // if user exists and password is correct
        if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
            // res.json({ message: 'You are authorized!' });
            const token = jwt.sign(
                { username: user.username, _id: user._id, role: user.role }, 
                process.env.JWT_SECRET
            );
            res.json({ token });
        } else {
            // this will throw an error and send a 400
            throw new Error('Invalid credentials.');

            // this will send a 200 with an error message
            // res.json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error(error);
        // res.status(400).json({ error: error.message });
        res.status(400).json({ error: 'Invalid Credentials' });
    }
});

module.exports = router;