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
    }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;