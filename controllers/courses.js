const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');


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
        // updatedCourse._doc.instructor = req.user;
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETE COURSE 
// needs to be checked
router.delete('/:id', async (req, res) => {
    try {
        // check this
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


// LESSONS ROUTES
// get all lessons
router.get('/:id/lessons', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.json({ lessons: course.lessons });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// post new lesson
router.post('/:id/lessons', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (req.user._id !== course.instructor.toString()) { 
            return res.status(401).json({ error: "Unauthorized" })
        } 
        // console.log(course)
        // console.log(course.instructor + " == " + req.user._id)
        course.lessons.push(req.body);
        // console.log(course.lessons)
        await course.save();
        const newLesson = course.lessons[course.lessons.length - 1];
  
        res.status(201).json(newLesson);
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
});

// get lesson by id
// no need

// update lesson
router.put('/:id/lessons/:lessonId', async (req, res) => { 
    try { 
        const course = await Course.findById(req.params.id); 
        // console.log(course)
        const lesson = course.lessons.id(req.params.lessonId);
        // console.log(lesson)
        // console.log(req.user._id)
        // console.log(course.instructor.toString());
         if (req.user._id !== course.instructor.toString()) { 
            return res.status(401).json({ error: "Unauthorized" })
         } 
         if (lesson) { 
            lesson.title = req.body.title || lesson.title;
            lesson.content = req.body.content || lesson.content; 
            await course.save(); 
            res.status(200).json({ lesson }); 
        } else { 
            res.status(404).json({ error: 'Lesson not found' }); 
        } 
    } catch (error) { 
        res.status(500).json({ error: error.message });
    }
});

// delete lesson
router.delete('/:id/lessons/:lessonId', async (req, res) => { 
    try { 
        const course = await Course.findById(req.params.id); 
        console.log(course)
        const lesson = course.lessons.id(req.params.lessonId); 
        console.log(lesson)
        if (req.user._id !== course.instructor.toString()) { 
            return res.status(401).json({ error: "Unauthorized" })
        } 
        if (lesson) { 
            course.lessons.remove({ _id: req.params.lessonId });
            await course.save();
            res.status(200).json({ message: 'Lesson deleted successfully' });
        } else { 
            res.status(404).json({ error: 'Lesson not found' });
        } 
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
});

// ENROLLMENT ROUTES
// student enrolls in a course
router.post('/:id/enroll', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (req.user.role !== 'student') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const existingEnrollment = await Enrollment.findOne({
            course: req.params.id,
            student: req.user._id,
        });
        // console.log(existingEnrollment)
        if (existingEnrollment) {
            if (existingEnrollment.status === 'completed') {
                return res.status(400).json({ error: 'Already completed this course' });
            } else if (existingEnrollment.status === 'withdrawn') {
                existingEnrollment.status = 'pending';
                await existingEnrollment.save();
                return res.status(200).json({ enrollment: existingEnrollment });
            }
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }
        const enrollment = new Enrollment({
            course: req.params.id,
            student: req.user._id,
        });
        await enrollment.save();
        res.status(201).json({ enrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// student withdraws from course
router.put('/:id/unenroll', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (req.user.role !== 'student') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const enrollment = await Enrollment.findOne({
            course: req.params.id,
            student: req.user._id,
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        enrollment.status = 'withdrawn';
        enrollment.completedLessonIds = [];
        await enrollment.save();
        res.status(200).json({ message: 'Course withdrawn', enrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/enroll', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (req.user.role !== 'student') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const enrollment = await Enrollment.findOne({
            course: req.params.id,
            student: req.user._id,
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        if (enrollment.status === 'completed') {
            return res.status(400).json({ error: 'Already completed this course' });
        }
        if (enrollment.status === 'pending') {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }
        enrollment.status = 'pending';
        await enrollment.save();
        res.status(200).json({ enrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// student completes a lesson in a course he is withdrawn from
router.put('/:id/lessons/:lessonId/complete', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        const lesson = course.lessons.id(req.params.lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        if (req.user.role !== 'student') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const enrollment = await Enrollment.findOne({
            course: req.params.id,
            student: req.user._id,
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        if (enrollment.completedLessonIds.includes(req.params.lessonId)) {
            return res.status(400).json({ error: 'Lesson already completed' });
        }
        enrollment.completedLessonIds.push(req.params.lessonId);
        await enrollment.save();
        res.status(200).json({ message: 'Lesson completed', enrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// student completes course after all lessons are completed
router.put('/:id/complete', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (req.user.role !== 'student') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const enrollment = await Enrollment.findOne({
            course: req.params.id,
            student: req.user._id,
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        if (enrollment.completedLessonIds.length !== course.lessons.length) {
            return res.status(400).json({ error: 'Not all lessons are completed' });
        }
        if (enrollment.status === 'wihtdrawn') {
            return res.status(400).json({ error: 'Course is withdrawn' });
        }
        enrollment.status = 'completed';
        await enrollment.save();
        res.status(200).json({ message: 'Course completed', enrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ course: req.params.id });
        res.status(200).json(enrollments);
        if (!enrollments) {
            return res.status(200).json({ message: 'No enrollments found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/enrollments/:userId', async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            course: req.params.id,
            student: req.params.userId,
        });
        if (!enrollment) {
            return res.status(200).json({ message: 'No enrollment found for this course' });
        }
        res.status(200).json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
