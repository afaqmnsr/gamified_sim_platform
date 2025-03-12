import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [inputArray, setInputArray] = useState([5, 3, 8, 4, 2]);
  const [results, setResults] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [graphInput, setGraphInput] = useState(`{
  "A": ["B", "C"],
  "B": ["D"],
  "C": [],
  "D": []
}`);
  const [startNode, setStartNode] = useState('A');

  const handleRunAlgorithm = async () => {
    try {
      const payload =
        selectedAlgorithm === 'bfs'
          ? {
            algorithm: selectedAlgorithm,
            graph: JSON.parse(graphInput),
            startNode: startNode
          }
          : {
            algorithm: selectedAlgorithm,
            inputData: inputArray
          };

      const response = await axios.post('http://localhost:5000/run-algorithm', payload);
      setResults(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Gamified Algorithm Simulation</h1>

      {/* Algorithm Selector */}
      <div className="mb-4 w-full max-w-md">
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Algorithm:</label>
        <select
          value={selectedAlgorithm}
          onChange={(e) => setSelectedAlgorithm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full"
        >
          <option value="bubbleSort">Bubble Sort</option>
          <option value="quickSort">Quick Sort</option>
          <option value="bfs">BFS</option>
        </select>
      </div>

      {/* Inputs Based on Algorithm */}
      {selectedAlgorithm === 'bfs' ? (
        <>
          <div className="mb-4 w-full max-w-md">
            <label className="block mb-2 text-sm font-medium text-gray-700">Graph (Adjacency List as JSON):</label>
            <textarea
              rows="5"
              value={graphInput}
              onChange={(e) => setGraphInput(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4 w-full max-w-md">
            <label className="block mb-2 text-sm font-medium text-gray-700">Start Node:</label>
            <input
              type="text"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>
        </>
      ) : (
        <div className="mb-4 w-full max-w-md">
          <label className="block mb-2 text-sm font-medium text-gray-700">Input Array (comma-separated):</label>
          <input
            type="text"
            value={inputArray.join(",")}
            onChange={(e) => setInputArray(e.target.value.split(",").map(Number))}
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
        </div>
      )}

      <button
        onClick={handleRunAlgorithm}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Run Algorithm
      </button>

      {/* Results */}
      {results && (
        <div className="mt-6 w-full max-w-md bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          {selectedAlgorithm === 'bfs' ? (
            <p><strong>Traversal Order:</strong> {results.traversalOrder ? results.traversalOrder.join(", ") : 'No traversal results'}</p>
          ) : (
            <p><strong>Sorted Array:</strong> {results.sortedArray ? results.sortedArray.join(", ") : 'No sorted results'}</p>
          )}

          <p><strong>Execution Time:</strong> {results.executionTime}</p>
          <p><strong>Memory Usage:</strong> {results.memoryUsage}</p>
          <p><strong>Energy Consumption:</strong> {results.energyConsumption}</p>
        </div>
      )}
    </div>
  );
}

export default App;