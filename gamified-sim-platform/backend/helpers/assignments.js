// Assignment Problems - Predefined (can be in DB later)
const assignments = [
    {
        id: 'shortestPath',
        title: 'Find Shortest Path',
        description: 'Given a graph, find the shortest path from start to target.',
        input: {
            graph: { A: ['B'], B: ['C'], C: [] },
            startNode: 'A',
            targetNode: 'C'
        },
        expectedOutput: ['A', 'B', 'C'], // Expected traversal order
        type: 'graph'
    },
    {
        id: 'knapsackProblem',
        title: 'Knapsack 0/1 Problem',
        description: 'Maximize the value in the knapsack.',
        input: {
            weights: [2, 3, 4, 5],
            values: [3, 4, 5, 6],
            capacity: 5
        },
        expectedOutput: 7, // Best value
        type: 'dp'
    }
];

module.exports = { assignments };