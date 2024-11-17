const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    }, 
);

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;