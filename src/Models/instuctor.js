const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// Instructor Attendance Schema
const instructorAttendanceSchema = new mongoose.Schema({
    instructorId: {
        type: ObjectId,
        required: true,
        ref:'InstructorUser',
        trim: true
    },
    checkInTime: Date,
    checkOutTime: Date
}, { timestamps: true });


module.exports = mongoose.model('Instructor', instructorAttendanceSchema)