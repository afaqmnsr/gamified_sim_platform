const { performance } = require('perf_hooks');

function runBubbleSort(inputArray) {
    const array = [...inputArray];
    const startTime = performance.now();

    let len = array.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - 1; j++) {
            if (array[j] > array[j + 1]) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }

    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2); // ms
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // MB

    // Mock energy consumption for now (replace with PowerAPI later)
    const energyConsumption = (executionTime * 0.0005).toFixed(4); // arbitrary multiplier

    return {
        sortedArray: array,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J` // Joules
    };
}

function runQuickSort(inputArray) {
    const array = [...inputArray];
    const startTime = performance.now();

    function quickSort(arr) {
        if (arr.length <= 1) return arr;
        const pivot = arr[arr.length - 1];
        const left = arr.filter(item => item < pivot);
        const right = arr.filter(item => item > pivot);
        return [...quickSort(left), pivot, ...quickSort(right)];
    }

    const sortedArray = quickSort(array);
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const energyConsumption = (executionTime * 0.0005).toFixed(4);

    return {
        sortedArray,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J`
    };
}

function runBFS(graph, startNode) {
    const startTime = performance.now();

    // Validate inputs
    if (!graph || typeof graph !== 'object') {
        throw new Error('Invalid graph structure');
    }

    if (!graph.hasOwnProperty(startNode)) {
        throw new Error(`Start node '${startNode}' does not exist in graph`);
    }

    const visited = new Set();
    const queue = [startNode];
    const traversalOrder = [];

    while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            traversalOrder.push(node);

            const neighbors = graph[node];
            if (!Array.isArray(neighbors)) {
                console.warn(`Node ${node} has no neighbors or invalid neighbors`);
                continue;
            }

            queue.push(...neighbors);
        }
    }

    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const energyConsumption = (executionTime * 0.0005).toFixed(4);

    return {
        traversalOrder,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J`
    };
}



module.exports = { runBubbleSort, runQuickSort, runBFS };
