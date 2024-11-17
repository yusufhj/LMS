const express = require('express');
const router = express.Router();
const Course = require('../models/course').Course;

// get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// post a new course
router.post('/', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json({ course });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// get a course by id
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (course) {
            res.json({ course });
        } else {
            res.status(404).json({ error: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// update a course by id
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate
        (req.params.id, req.body, { new: true });
        if (course) {
            res.json({ course });
        } else {
            res.status(404).json({ error: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;