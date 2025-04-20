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
        console: console,
        steps: [],
        recordStep: (step) => {
          sandbox.steps.push(step);
        }
    };

    const startTime = performance.now();

    try {
        vm.createContext(sandbox);

      const codeToRun = `
      const runAlgo = ${userCode};

      // Debug logs inside the VM (Optional)
      console.log("Inside VM -> input:", input);
      console.log("Inside VM -> graph:", graph);
      console.log("Inside VM -> startNode:", startNode);

      // Case 1: If graph + startNode + targetNode exist, pass them as an object (common in JS)
      if (
        input &&
        input.graph &&
        input.startNode &&
        typeof input.targetNode !== 'undefined'
      ) {
        customResult = runAlgo({
          graph: input.graph,
          startNode: input.startNode,
          targetNode: input.targetNode
        });
      } else if (input && input.graph && input.startNode) {
        traversalOrder = runAlgo(input.graph, input.startNode);
      } else if (graph && startNode) {
        const result = runAlgo(graph, startNode);
        if (typeof result === 'object' && result.traversalOrder) {
          traversalOrder = result.traversalOrder;
          if (result.steps) {
            steps = result.steps;
          }
        } else {
          traversalOrder = result;
        }
      } else if (Array.isArray(input)) {
        sortedArray = runAlgo(input);
      } else if (input && input.graph && input.source && input.sink) {
        customResult = runAlgo({
          graph: input.graph,
          source: input.source,
          sink: input.sink
        });
      } else if (typeof input === 'object' || typeof input === 'number') {
        const result = runAlgo(input);
        if (result && typeof result === 'object') {
          if ('dpMatrix' in result) {
            dpMatrix = result.dpMatrix;
          }
          if ('steps' in result) {
            steps = result.steps;
          }
          if ('result' in result) {
            dpResult = result.result;
          } else {
            customResult = result;
          }
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
            customResult: sandbox.customResult,
            dpMatrix: sandbox.dpMatrix,
            executionTime: `${executionTime} ms`,
            memoryUsage: `${memoryUsage} MB`,
            energyConsumption: `${energyConsumption} J`,
            score,
            steps: sandbox.steps
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