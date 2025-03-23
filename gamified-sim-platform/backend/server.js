const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const { runUserCode } = require('./userAlgorithmRunner');

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));