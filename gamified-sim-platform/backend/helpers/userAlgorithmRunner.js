const { performance } = require('perf_hooks');
const vm = require('vm');

async function runUserCode({ userCode, inputData, graph, startNode }) {
    const sandbox = {
        input: inputData,   // Accept complex structured input now
        graph: graph || {},
        startNode: startNode || '',
        sortedArray: [],
        traversalOrder: [],
        dpResult: null,     // For DP algorithm results
        customResult: null, // Added for custom assignments
        console: console
    };

    const startTime = performance.now();

    try {
        vm.createContext(sandbox);

      const codeToRun = `
      const runAlgo = ${userCode};
      // Auto detect which arguments to pass
      if (graph && startNode) {
        traversalOrder = runAlgo(graph, startNode);
      } else if (Array.isArray(input)) {
        sortedArray = runAlgo(input);
      } else if (typeof input === 'object' || typeof input === 'number') {
        const result = runAlgo(input);
        if (Array.isArray(result) || typeof result === 'object' || typeof result === 'number' || typeof result === 'boolean') {
          customResult = result;
        } else {
          dpResult = result;
        }
      } else {
        throw new Error('Unsupported input type for this algorithm');
      }
    `;

        vm.runInContext(codeToRun, sandbox, { timeout: 1000 });

        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const energyConsumption = (executionTime * 0.0005).toFixed(4);
        const score = calculateScore(executionTime, memoryUsage, energyConsumption);

        return {
            sortedArray: sandbox.sortedArray,
            traversalOrder: sandbox.traversalOrder,
            dpResult: sandbox.dpResult,
            executionTime: `${executionTime} ms`,
            memoryUsage: `${memoryUsage} MB`,
            energyConsumption: `${energyConsumption} J`,
            score
        };
    } catch (err) {
        console.error(`❌ VM Execution Error: ${err.message}`);
        throw new Error(`User code failed: ${err.message}`);
    }
}

function calculateScore(execTime, memUsage, energyCons) {
    const timeScore = Math.max(0, 100 - parseFloat(execTime));
    const memScore = Math.max(0, 100 - parseFloat(memUsage));
    const energyScore = Math.max(0, 100 - (parseFloat(energyCons) * 1000));
    return ((timeScore + memScore + energyScore) / 3).toFixed(2);
}

module.exports = { runUserCode };