const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;
const { runBubbleSort, runQuickSort, runMergeSort, runBFS } = require('./algorithms');
const { runUserCode } = require('./userAlgorithmRunner');

app.use(cors());
app.use(express.json());

// API Routes
app.post('/run-algorithm', (req, res) => {
    const { algorithm, inputData, graph, startNode } = req.body;

    console.log('Received algorithm:', algorithm); // Debug log

    try {
        let result;

        switch (algorithm) {
            case 'bubbleSort':
                result = runBubbleSort(inputData);
                break;
            case 'quickSort':
                result = runQuickSort(inputData);
                break;
            case 'mergeSort':
                result = runMergeSort(inputData);
                break;
            case 'bfs':
                if (!graph || !startNode) {
                    return res.status(400).json({ error: 'Graph and startNode are required for BFS' });
                }
                result = runBFS(graph, startNode);
                break;
            default:
                console.error('Unsupported algorithm:', algorithm); // Add this log too
                return res.status(400).json({ error: 'Unsupported algorithm' });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/run-user-algorithm', async (req, res) => {
    const { userCode, inputData } = req.body;

    if (!userCode || !inputData) {
        return res.status(400).json({ error: 'User code and input data are required.' });
    }

    try {
        const result = await runUserCode(userCode, inputData);
        res.json(result);
    } catch (err) {
        console.error('User algorithm execution error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
