import React, { useState } from 'react';
import axios from 'axios';
import Badges from './Badges';

const defaultCode = `(arr) => {
  // Example: Bubble Sort
  let len = arr.length;
  for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - 1; j++) {
          if (arr[j] > arr[j + 1]) {
              let temp = arr[j];
              arr[j] = arr[j + 1];
              arr[j + 1] = temp;
          }
      }
  }
  return arr;
}`;

const CustomAlgorithmEditor = ({ inputArray }) => {
    const [userCode, setUserCode] = useState(defaultCode);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleRunUserCode = async () => {
        try {
            setError(null);
            const response = await axios.post('http://localhost:5000/run-user-algorithm', {
                userCode,
                inputData: inputArray
            });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="w-full max-w-4xl bg-white shadow rounded p-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Custom Algorithm Editor</h2>
            <textarea
                rows={15}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full p-4 border rounded font-mono text-sm"
            />
            <button
                onClick={handleRunUserCode}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
                Run Custom Algorithm
            </button>

            {error && (
                <div className="mt-4 text-red-600">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {results && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Results</h3>
                    <p><strong>Sorted Array:</strong> {results.sortedArray.join(", ")}</p>
                    <p><strong>Execution Time:</strong> {results.executionTime}</p>
                    <p><strong>Memory Usage:</strong> {results.memoryUsage}</p>
                    <p><strong>Energy Consumption:</strong> {results.energyConsumption}</p>
                    <p><strong>Score:</strong> {results.score}</p>

                    {/* Badge based on score */}
                    <Badges score={results.score} />
                </div>
            )}
        </div>
    );
};

export default CustomAlgorithmEditor;