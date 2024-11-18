const express = require('express');
const verifyToken = require('../middleware/verify-token');
const Course = require('../models/course');
const router = express.Router();

// ======= Public Routes ===========

// INDEX - GET ALL COURSES
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ createdAt: 'desc' });
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json(error);
    }
});

// SHOW - GET ONE COURSE BY ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json(error);
    }
});

// ======= Protected Routes ==========
router.use(verifyToken);

// CREATE COURSE
router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        req.body.instructor = req.user._id;
        const course = await Course.create(req.body);
        course._doc.instructor = req.user;
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json(error);
    }
});

// UPDATE COURSE
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        updatedCourse._doc.instructor = req.user;
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETE COURSE
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await course.deleteOne();
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
