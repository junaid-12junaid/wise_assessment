const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// Instructor Attendance Schema
const instructorAttendanceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true });


module.exports = mongoose.model('InstructorUser', instructorAttendanceSchema)