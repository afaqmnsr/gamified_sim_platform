import React from 'react';

const ResultsDisplay = ({ selectedAlgorithm, results }) => {
    if (!results) return null;

    return (
        <div className="mt-6 w-full max-w-md bg-white shadow rounded p-4">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            {selectedAlgorithm === 'bfs' ? (
                <p><strong>Traversal Order:</strong> {results.traversalOrder ? results.traversalOrder.join(", ") : 'N/A'}</p>
            ) : (
                <p><strong>Sorted Array:</strong> {results.sortedArray ? results.sortedArray.join(", ") : 'N/A'}</p>
            )}

            <p><strong>Execution Time:</strong> {results.executionTime}</p>
            <p><strong>Memory Usage:</strong> {results.memoryUsage}</p>
            <p><strong>Energy Consumption:</strong> {results.energyConsumption}</p>
        </div>
    );
};

export default ResultsDisplay;