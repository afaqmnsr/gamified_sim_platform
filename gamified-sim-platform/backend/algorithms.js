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
    const score = calculateScore(executionTime, memoryUsage, energyConsumption);

    return {
        sortedArray: array,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J`, // Joules
        score
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
    const score = calculateScore(executionTime, memoryUsage, energyConsumption);

    return {
        sortedArray,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J`,
        score
    };
}

function runMergeSort(inputArray) {
    const array = [...inputArray];
    const startTime = performance.now();

    function mergeSort(arr) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = mergeSort(arr.slice(0, mid));
        const right = mergeSort(arr.slice(mid));

        return merge(left, right);
    }

    function merge(left, right) {
        const result = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    const sortedArray = mergeSort(array);

    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const energyConsumption = (executionTime * 0.0005).toFixed(4);
    const score = calculateScore(executionTime, memoryUsage, energyConsumption);

    return {
        sortedArray,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J`,
        score
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
    const score = calculateScore(executionTime, memoryUsage, energyConsumption);

    return {
        traversalOrder,
        executionTime: `${executionTime} ms`,
        memoryUsage: `${memoryUsage} MB`,
        energyConsumption: `${energyConsumption} J`,
        score
    };
}

function calculateScore(execTime, memUsage, energyCons) {
    const timeScore = Math.max(0, 100 - parseFloat(execTime));
    const memScore = Math.max(0, 100 - parseFloat(memUsage));
    const energyScore = Math.max(0, 100 - (parseFloat(energyCons) * 1000));
    return ((timeScore + memScore + energyScore) / 3).toFixed(2);
}

module.exports = {
    runBubbleSort,
    runQuickSort,
    runMergeSort,
    runBFS
};
