const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        }
    }, 
);

const courseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lessons: [lessonSchema],
    }, 
);


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;