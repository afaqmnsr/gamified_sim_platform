const express = require('express');
const cors = require('cors');
const axios = require('axios');  // ✅
const app = express();
const _ = require('lodash');
const PORT = 5000;

const { runUserCode } = require('./helpers/userAlgorithmRunner');
const { assignments } = require('./helpers/assignments');

let assignmentSubmissions = []; // In-memory storage for scores

app.use(cors());
app.use(express.json());

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
app.get('/assignments', (req, res) => {
    res.json(assignments);
});

// Submit assignment and auto-evaluate
app.post('/submit-assignment', async (req, res) => {
    const { assignmentId, userCode, username = 'Anonymous' } = req.body;

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

        const submission = {
            assignmentId,
            username,
            isCorrect,
            score: isCorrect ? result.score : 0,
            time: new Date().toISOString()
        };

        assignmentSubmissions.push(submission);

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

        console.log(response.data)

        const { result, output, error } = response.data;
        res.json({
            result,            // universal
            customResult: result, // backward-compatibility
            sortedArray: Array.isArray(result) ? result : null, // auto-map for sorting
            output,
            error,
            executionTime: 'N/A',
            memoryUsage: 'N/A',
            energyConsumption: 'N/A',
            score: 'N/A'
        });
    } catch (err) {
        console.error('Python execution failed:', err.message);
        res.status(500).json({ error: 'Failed to execute Python code' });
    }
});

app.post('/admin/add-assignment', (req, res) => {
    const newAssignment = {
        id: req.body.title.toLowerCase().replace(/\s+/g, ''),
        ...req.body
    };

    assignments.push(newAssignment);
    // Optional: save to file/db later
    res.json({ message: 'Assignment added!', assignment: newAssignment });
});

app.get('/admin/submissions', (req, res) => {
    res.json(assignmentSubmissions);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));