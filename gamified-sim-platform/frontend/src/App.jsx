import React, { useState } from 'react';
import axios from 'axios';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultsDisplay from './components/ResultsDisplay';
import GraphVisualizer from './components/GraphVisualizer';

function App() {
  const [inputArray, setInputArray] = useState([5, 3, 8, 4, 2]);
  const [graphInput, setGraphInput] = useState(`{
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
  }`);
  const [startNode, setStartNode] = useState('A');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [results, setResults] = useState(null);

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
      console.error('Error running algorithm:', error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Gamified Algorithm Simulation</h1>

      <AlgorithmSelector
        selectedAlgorithm={selectedAlgorithm}
        setSelectedAlgorithm={setSelectedAlgorithm}
        inputArray={inputArray}
        setInputArray={setInputArray}
        graphInput={graphInput}
        setGraphInput={setGraphInput}
        startNode={startNode}
        setStartNode={setStartNode}
      />

      <button
        onClick={handleRunAlgorithm}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Run Algorithm
      </button>

      <ResultsDisplay selectedAlgorithm={selectedAlgorithm} results={results} />

      {/* Show GraphVisualizer only if BFS is selected */}
      {selectedAlgorithm === 'bfs' && results && (
        <GraphVisualizer
          graph={JSON.parse(graphInput)}
          traversalOrder={results.traversalOrder}
        />
      )}

    </div>
  );
}

export default App;