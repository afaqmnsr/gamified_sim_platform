import React from 'react';

const AlgorithmSelector = ({
    selectedAlgorithm,
    setSelectedAlgorithm,
    inputArray,
    setInputArray,
    graphInput,
    setGraphInput,
    startNode,
    setStartNode
}) => {
    return (
        <div className="mb-4 w-full max-w-md">
            <label className="block mb-2 text-sm font-medium text-gray-700">Select Algorithm:</label>
            <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
            >
                <option value="bubbleSort">Bubble Sort</option>
                <option value="quickSort">Quick Sort</option>
                <option value="mergeSort">Merge Sort</option>
                <option value="bfs">BFS (Breadth-First Search)</option>
            </select>

            {/* Render inputs based on algorithm type */}
            {['bubbleSort', 'quickSort', 'mergeSort'].includes(selectedAlgorithm) && (
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Input Array (comma-separated):</label>
                    <input
                        type="text"
                        value={inputArray.join(",")}
                        onChange={(e) => setInputArray(e.target.value.split(",").map(Number))}
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                    />
                </div>
            )}

            {selectedAlgorithm === 'bfs' && (
                <>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Graph (Adjacency List JSON):</label>
                        <textarea
                            rows="5"
                            value={graphInput}
                            onChange={(e) => setGraphInput(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Start Node:</label>
                        <input
                            type="text"
                            value={startNode}
                            onChange={(e) => setStartNode(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2 w-full"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default AlgorithmSelector;