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
// // LESSONS ROUTES
// // get all lessons
// router.post('/:id/lessons', async (req, res) => {
//     try {
//         const course = await Course.findById(req.params.id);
//         if (req.user._id !== course.instructor) {
//             return res.status(401).json({ error: "Unauthorized"})
//         }
//         // console.log(course)
//         // console.log(course.instructor + " == " + req.user._id)

//       course.lessons.push(req.body);
//       console.log(course.lessons)
//       await course.save();
  
//       const newLesson = course.lessons[course.lessons.length - 1];
  
//       res.status(201).json(newLesson);
//     } catch (error) {
//       res.status(500).json(error);
//     }
// });

// // get lesson by id
// router.put('/:id/lessons/:lessonsId', async (req, res) => {
//     try {
//         const course = await Course.findById(req.params.courseId)
//         const lesson = course.lessons.id(req.params.lessonId)
//         lesson.text = req.body.text
//         await course.save()
//         res.status(200).json({ message: 'Ok' })
//     } catch (error) {
//         res.status(500).json(error)
//     }
// })

// // update lesson
// router.put('/:id/lessons/:lessonId', async (req, res) => { 
//     try { 
//         const course = await Course.findById(req.params.id); 
//         const lesson = course.lessons.id(req.params.lessonId);
//          if (req.user._id !== course.instructor) { 
//             return res.status(401).json({ error: "Unauthorized" })
//          } 
//          if (lesson) { 
//             lesson.title = req.body.title || lesson.title;
//              lesson.content = req.body.content || lesson.content; 
//              await course.save(); 
//              res.status(200).json({ lesson }); 
//         } else { 
//                 res.status(404).json({ error: 'Lesson not found' }); 
//         } 
//     } 
//             catch (error) { res.status(500).json(error);
//             }
// });

// // delete lesson
// router.delete('/:id/lessons/:lessonId', async (req, res) => { 
//     try { 
//         const course = await Course.findById(req.params.id); 
//         const lesson = course.lessons.id(req.params.lessonId); 
//         if (req.user._id !== course.instructor) { 
//             return res.status(401).json({ error: "Unauthorized" }) 
//         } 
//         if (lesson) { 
//             lesson.remove(); 
//             await course.save(); 
//             res.status(200).json({ message: 'Lesson deleted successfully' });
//          } 
//          else { 
//             res.status(404).json({ error: 'Lesson not found' });
//         } } catch (error) {
//              res.status(500).json(error);
//     } 
// });


// module.exports = router;
