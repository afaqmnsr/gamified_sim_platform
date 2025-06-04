const express = require('express');
const Course = require('../models/Course'); // Assuming you have a Course model
const router = express.Router();

// routes/courses.js
router.post('/create', async (req, res) => {
    const { name, description, instructor, students = [], assignments = [] } = req.body;

    const course = new Course({ name, description, instructor, students, assignments });
    await course.save();

    res.json({ message: 'Course created successfully!', course });
});

router.get('/', async (req, res) => {
    const courses = await Course.find().populate('instructor', 'username').populate('students', 'username');
    res.json(courses);
});

router.put('/:courseId/assignments', async (req, res) => {
    const { assignments } = req.body;
    await Course.findByIdAndUpdate(req.params.courseId, { assignments });
    res.json({ message: 'Assignments updated' });
});

router.post('/:courseId/add-student', async (req, res) => {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course.students.includes(studentId)) {
        course.students.push(studentId);
        await course.save();
    }
    res.json({ message: 'Student added' });
});

router.post('/:courseId/set-instructor', async (req, res) => {
    const { instructorId } = req.body;
    await Course.findByIdAndUpdate(req.params.courseId, { instructor: instructorId });
    res.json({ message: 'Instructor assigned' });
});

module.exports = router;