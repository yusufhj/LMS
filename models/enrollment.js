const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'completed', 'withdrawn', ],
        },
        completedLessonIds: [
            {
                type: String
            }
        ],
    }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;