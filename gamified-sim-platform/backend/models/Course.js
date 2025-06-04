const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{ type: String }] // list of assignment IDs
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
