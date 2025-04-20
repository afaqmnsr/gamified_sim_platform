// Assignment Problems - Predefined (can be in DB later)
const assignments = [
    {
        id: 'shortestPath',
        title: 'Find Shortest Path',
        description: 'Given a graph, find the shortest path from start to target.',
        input: {
            graph: {
                A: ['B'],
                B: ['C'],
                C: []
            },
            startNode: 'A',
            targetNode: 'C'
        },
        expectedOutput: ['A', 'B', 'C'], // ✅ Correct answer based on the graph!
        expectedResultType: 'customResult',
        type: 'graph'
    },
    {
        id: 'knapsackProblem',
        title: 'Knapsack 0/1 Problem',
        description: 'Maximize the value in the knapsack.',
        input: {
            weights: [1, 3, 4, 5],
            values: [1, 4, 5, 7],
            capacity: 7
        },
        expectedOutput: 9, // Best value (items 3 and 4)
        type: 'dp',
        difficulty: 'Medium',
        code: `({ weights, values, capacity }) => {
            // Implement 0/1 Knapsack DP solution
            // Return the maximum value that fits in the knapsack
            return 0;
        }`,
        smtSpec: {
            type: 'knapsackOptimal',
            constraints: {
                capacityNonNegative: true,
                weightsPositive: true,
                valuesPositive: true
            }
        },
        expectedResultType: 'dpResult',
        unlocksAfter: ['shortestPath'] // or multiple like ['shortestPath', 'topKFrequentElements']
    },
    {
        id: 'topKFrequentElements',
        title: 'Top K Frequent Elements',
        description: 'Find the top K most frequent elements from the input array.',
        input: {
            array: [1, 1, 1, 2, 2, 3],
            k: 2
        },
        expectedOutput: [1, 2], // Order matters
        type: 'custom',
        difficulty: 'Medium',
        code: `({ array, k }) => {
            // Implement an algorithm to find top K frequent elements
            // Return an array of top K frequent elements
            return [];
        }`,
        expectedResultType: 'customResult',
        unlocksAfter: ['knapsackProblem'] // Unlocks after completing knapsackProblem assignment
    },
    {
        id: 'isGraphBipartite',
        title: 'Is Graph Bipartite?',
        description: 'Check if the given graph is bipartite.',
        input: {
            graph: {
                0: [1, 3],
                1: [0, 2],
                2: [1, 3],
                3: [0, 2]
            }
        },
        expectedOutput: true,
        type: 'custom',
        difficulty: 'Medium',
        code: `({ graph }) => {
            // Implement an algorithm to check if the graph is bipartite
            // Return true or false
            return false;
        }`,
        expectedResultType: 'customResult',
        unlocksAfter: ['topKFrequentElements'] // Unlocks after completing topKFrequentElements assignment
    },
    {
        id: 'coinChange',
        title: 'Minimum Coin Change',
        description: 'Given coins denominations and an amount, find the minimum number of coins.',
        input: {
            coins: [1, 2, 5],
            amount: 11
        },
        expectedOutput: 3, // 5+5+1
        type: 'dp',
        difficulty: 'Hard',
        code: `({ coins, amount }) => {
            // Implement a DP solution to find minimum number of coins for given amount
            // Return the minimum number of coins
            return -1;
        }`,
        expectedResultType: 'dpResult',
        unlocksAfter: ['isGraphBipartite'] // Unlocks after completing isGraphBipartite assignment
    },
    {
        id: 'mergeIntervals',
        title: 'Merge Overlapping Intervals',
        description: 'Given a collection of intervals, merge all overlapping intervals.',
        input: {
            intervals: [[1, 3], [2, 6], [8, 10], [15, 18]]
        },
        expectedOutput: [[1, 6], [8, 10], [15, 18]],
        type: 'custom',
        difficulty: 'Medium',
        code: `({ intervals }) => {
            // Implement interval merging logic
            // Return merged intervals
            return [];
        }`,
        expectedResultType: 'customResult',
        unlocksAfter: ['coinChange'] // Unlocks after completing coinChange assignment
    }

];

module.exports = { assignments };