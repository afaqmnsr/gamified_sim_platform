const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;
const { runBubbleSort, runQuickSort, runBFS } = require('./algorithms');


app.use(cors());
app.use(express.json());

// API Routes
app.post('/run-algorithm', (req, res) => {
    const { algorithm, inputData, graph, startNode } = req.body;

    try {
        if (algorithm === 'bubbleSort') {
            const result = runBubbleSort(inputData);
            res.json(result);
        } else if (algorithm === 'quickSort') {
            const result = runQuickSort(inputData);
            res.json(result);
        } else if (algorithm === 'bfs') {
            if (!graph || !startNode) {
                return res.status(400).json({ error: 'Graph and startNode are required for BFS' });
            }
            const result = runBFS(graph, startNode);
            res.json(result);
        } else {
            res.status(400).json({ error: 'Unsupported algorithm' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
