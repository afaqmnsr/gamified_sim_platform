const express = require('express');
const cors = require('cors');
const axios = require('axios');  // ✅
const app = express();
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const PORT = 5000;

// Allow CORS from localhost:5173 (Vite dev server)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

mongoose.connect('mongodb://localhost:27017/algorithmSimulator', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'super_secret_key_change_me';

const { runUserCode } = require('./helpers/userAlgorithmRunner');
const { assignments } = require('./helpers/assignments');
const AssignmentInteractionLog = require('./models/AssignmentInteractionLog');

let assignmentSubmissions = [];

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

app.use('/api/auth', authRoutes);
app.use('/api/course', authenticate, courseRoutes);

// Run Algorithm
app.post('/run-user-algorithm', async (req, res) => {
    const { userCode, inputData, graph, startNode } = req.body;

    if (!userCode) {
        return res.status(400).json({ error: 'User code is required.' });
    }

    try {
        const result = await runUserCode({ userCode, inputData, graph, startNode });
        res.json(result);
    } catch (err) {
        console.error('User algorithm execution error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all assignments
// app.get('/assignments', (req, res) => {
//     res.json(assignments);
// });
app.get('/assignments', authenticate, async (req, res) => {
    const user = await User.findById(req.user.id);
    const completed = user?.completedAssignments || [];

    const visibleAssignments = assignments.map((a) => {
        const isUnlocked = !a.unlocksAfter || a.unlocksAfter.every(dep => completed.includes(dep));
        const isCompleted = completed.includes(a.id); // Check if the assignment is completed
        return {
            ...a,
            unlocked: isUnlocked,
            completed: isCompleted 
        };
    });

    res.json(visibleAssignments);
});

// Submit assignment and auto-evaluate
app.post('/submit-assignment', authenticate, async (req, res) => {
    const { assignmentId, userCode } = req.body;
    // const username = req.user.email;

    try {
        const assignment = assignments.find(a => a.id === assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Validate userCode before running it
        if (!userCode || userCode.length < 10) {
            return res.status(400).json({ error: 'Submitted code is too short or missing.' });
        }

        const result = await runUserCode({
            userCode,
            inputData: assignment.input
        });

        // Auto-evaluation logic
        let isCorrect = false;
        const expected = assignment.expectedOutput;

        // Decide which result field to check
        const expectedField = assignment.expectedResultType ||
            (assignment.type === 'dp' ? 'dpResult' :
                assignment.id === 'shortestPath' ? 'customResult' : 'traversalOrder');

        const actualResult = result[expectedField];

        // Debug logs
        console.log('Checking field:', expectedField);
        console.log('Expected:', expected);
        console.log('Actual:', actualResult);

        isCorrect = _.isEqual(actualResult, expected);

        const userDoc = await User.findById(req.user.id);

        if (isCorrect) {
           
            if (userDoc && !userDoc.completedAssignments.includes(assignmentId)) {
                userDoc.completedAssignments.push(assignmentId);
                await userDoc.save();
            }
        }

        // Update retry count
        const retryKey = `${req.user.id}-${assignmentId}`;
        if (!global.retryTracker) global.retryTracker = {};
        if (!global.retryTracker[retryKey]) global.retryTracker[retryKey] = 0;
        global.retryTracker[retryKey] += 1;

        await AssignmentInteractionLog.create({
            userId: req.user.id,
            assignmentId,
            action: 'submit',
            metadata: {
                retryCount: global.retryTracker[retryKey],
                isCorrect,
                score: result.score,
                timeTaken: Date.now() - req.body.startTime
            }
        });

        let submission = {
            assignmentId,
            userId: req.user.id,
            submittedAt: new Date(),
            isCorrect,
            score: isCorrect ? result.score : 0,
            userCode,
            result
        };

        if (userDoc) {

            // Save submission history
            if (!userDoc.submissionHistory) {
                userDoc.submissionHistory = [];
            }

            userDoc.submissionHistory.push(submission);

            // Save even if incorrect to keep full history
            await userDoc.save();
        }

        res.json({
            ...submission,
            message: isCorrect
                ? 'Correct solution!'
                : 'Incorrect solution. Check your logic and try again!',
            performance: result
        });

    } catch (error) {
        console.error('Assignment submission error:', error.message);
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
});

app.post('/reset-progress', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.completedAssignments = [];
        await user.save();
        res.json({ message: 'Progress reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to reset progress' });
    }
});

// Get leaderboard for an assignment
app.get('/assignment-leaderboard/:assignmentId', (req, res) => {
    const { assignmentId } = req.params;
    
    const leaderboard = assignmentSubmissions
        .filter(s => s.assignmentId === assignmentId && s.isCorrect)
        .sort((a, b) => b.score - a.score);
    res.json(leaderboard);
});

// Analyze algorithm via SMT Solver
app.post('/analyze-smt', async (req, res) => {
    const { algorithmType, params } = req.body;

    try {
        const response = await axios.post('http://localhost:6000/analyze', {
            algorithmType,
            constraints: params // ✅ FIX: send params AS constraints
        });

        res.json(response.data);
    } catch (error) {
        console.error('SMT Analysis Error:', error.message);
        res.status(500).json({ error: 'Failed to analyze algorithm' });
    }
});

app.post('/analyze-smt-assignment', async (req, res) => {
    const { assignmentId } = req.body;
    const assignment = assignments.find(a => a.id === assignmentId);

    if (!assignment || !assignment.smtSpec) {
        return res.status(404).json({ error: 'No SMT spec for this assignment' });
    }

    try {
        const response = await axios.post('http://localhost:6000/analyze', {
            algorithmType: assignment.smtSpec.type,
            constraints: assignment.smtSpec.constraints
        });

        res.json(response.data);
    } catch (error) {
        console.error('SMT Assignment Analysis Error:', error.message);
        res.status(500).json({ error: 'SMT analysis failed' });
    }
});

app.post('/analyze-symbolic-execution', async (req, res) => {
    const { code } = req.body;

    try {
        const response = await axios.post('http://localhost:6000/analyze', {
            algorithmType: 'symbolicExecution',
            code
        });

        res.json(response.data);
    } catch (error) {
        console.error('Symbolic Execution Error:', error.message);
        res.status(500).json({ error: 'Symbolic execution failed' });
    }
});

// Run Python Code
app.post('/run-python-code', async (req, res) => {
    const { userCode, inputData } = req.body;

    try {
        const response = await axios.post('http://localhost:7000/run-python', {
            code: userCode,
            input: inputData
        });

        const { result, output, error, executionTime, memoryUsage, energyConsumption, score } = response.data;

        res.json({
            result,
            customResult: result,
            sortedArray: Array.isArray(result) ? result : null,
            output,
            error,
            executionTime: executionTime || 'N/A',
            memoryUsage: memoryUsage || 'N/A',
            energyConsumption: energyConsumption || 'N/A',
            score: score || 'N/A'
        });

    } catch (err) {
        console.error('Python execution failed:', err.message);
        res.status(500).json({ error: 'Failed to execute Python code' });
    }
});

app.post('/admin/add-assignment', authenticate, (req, res) => {
    const newAssignment = {
        id: req.body.title.toLowerCase().replace(/\s+/g, ''),
        ...req.body
    };

    assignments.push(newAssignment);
    // Optional: save to file/db later
    res.json({ message: 'Assignment added!', assignment: newAssignment });
});

app.put('/admin/update-assignment/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const index = assignments.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Assignment not found' });
    }

    const updatedAssignment = {
        ...assignments[index],
        ...req.body,
        id // preserve original ID
    };

    assignments[index] = updatedAssignment;

    res.json({ message: 'Assignment updated!', assignment: updatedAssignment });
});

// Get a specific user's submission history (admin-only or self)
app.get('/admin/user-submissions/:userId', authenticate, async (req, res) => {
    const requester = await User.findById(req.user.id);
    const targetId = req.params.userId;

    if (requester.role !== 'admin' && requester._id.toString() !== targetId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const user = await User.findById(targetId).select('username email submissionHistory');
        res.json(user.submissionHistory || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

app.get('/admin/users', authenticate, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const users = await User.find().select('-password');
    res.json(users);
});

app.delete('/admin/users/:id', authenticate, async (req, res) => {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.put('/admin/users/:id', authenticate, async (req, res) => {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true }
        );

        res.json({ message: 'Role updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

app.post('/log-interaction', authenticate, async (req, res) => {
    try {
        const { assignmentId = "", action, metadata, hasError = false, resultData = {} } = req.body;

        await AssignmentInteractionLog.create({
            userId: req.user.id,
            assignmentId,
            action,
            metadata,
            timestamp: new Date(),
            hasError,
            resultData
        });

        res.json({ message: 'Logged successfully' });
    } catch (err) {
        console.error('Log error:', err);
        res.status(500).json({ error: 'Failed to log interaction' });
    }
});

app.get('/interaction-logs/:userId?', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const requester = await User.findById(req.user.id);

        if (userId && requester.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can view other users\' logs.' });
        }

        const targetUserId = userId || req.user.id;

        const logs = await AssignmentInteractionLog.find({ userId: targetUserId })
            .sort({ timestamp: -1 })
            .lean();

        res.json(logs);
    } catch (err) {
        console.error('Fetch logs error:', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));