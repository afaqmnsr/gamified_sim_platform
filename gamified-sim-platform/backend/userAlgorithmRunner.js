const { performance } = require('perf_hooks');
const vm = require('vm');

async function runUserCode({ userCode, inputData, graph, startNode }) {
    const sandbox = {
        input: [...(inputData || [])],
        graph: graph || {},
        startNode: startNode || '',
        sortedArray: [],
        traversalOrder: [],
        console: console
    };

    const startTime = performance.now();

    try {
        vm.createContext(sandbox);

        const codeToRun = `
      const runAlgo = ${userCode};
      if (input.length) {
        sortedArray = runAlgo(input);
      } else {
        traversalOrder = runAlgo(graph, startNode);
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
            executionTime: `${executionTime} ms`,
            memoryUsage: `${memoryUsage} MB`,
            energyConsumption: `${energyConsumption} J`,
            score
        };
    } catch (err) {
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