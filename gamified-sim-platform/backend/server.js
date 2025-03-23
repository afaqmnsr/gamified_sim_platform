const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const { runUserCode } = require('./helpers/userAlgorithmRunner');
const { assignments } = require('./helpers/assignments');

let assignmentSubmissions = []; // In-memory storage for scores

app.use(cors());
app.use(express.json());

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
            inputData: assignment.input,
            graph: assignment.type === 'graph' ? assignment.input.graph : null,
            startNode: assignment.type === 'graph' ? assignment.input.startNode : null
        });

        // Auto-evaluation logic
        let isCorrect = false;

        try {
            // Validate result matches expected
            if (assignment.type === 'graph') {
                isCorrect = JSON.stringify(result.traversalOrder) === JSON.stringify(assignment.expectedOutput);
            } else if (assignment.type === 'dp') {
                isCorrect = result.dpResult === assignment.expectedOutput;
            } else {
                throw new Error('Unknown assignment type');
            }
        } catch (e) {
            console.warn('Comparison failed:', e.message);
        }

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));