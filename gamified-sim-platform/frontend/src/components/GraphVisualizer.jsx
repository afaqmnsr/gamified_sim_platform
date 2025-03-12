import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const GraphVisualizer = ({ graph, traversalOrder }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [traversalIndex, setTraversalIndex] = useState(0);

    // Convert graph data to nodes and edges
    const generateGraphElements = useCallback(() => {
        const newNodes = [];
        const newEdges = [];

        Object.keys(graph).forEach((nodeId) => {
            newNodes.push({
                id: nodeId,
                data: { label: nodeId },
                position: {
                    x: Math.random() * 400,
                    y: Math.random() * 400
                },
                style: {
                    backgroundColor: '#d1d5db',
                    color: '#333',
                    border: '1px solid #333',
                }
            });

            graph[nodeId].forEach((neighbor) => {
                newEdges.push({
                    id: `${nodeId}-${neighbor}`,
                    source: nodeId,
                    target: neighbor
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [graph]);

    // Animate traversal in real-time
    useEffect(() => {
        if (!traversalOrder || traversalOrder.length === 0) return;

        generateGraphElements(); // Reset all nodes before starting

        let index = 0;
        const interval = setInterval(() => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === traversalOrder[index]) {
                        return {
                            ...node,
                            style: {
                                ...node.style,
                                backgroundColor: '#4ade80', // green
                                color: '#fff',
                                border: '2px solid #22c55e'
                            }
                        };
                    }
                    return node;
                })
            );

            index++;

            if (index >= traversalOrder.length) {
                clearInterval(interval);
            } else {
                setTraversalIndex(index);
            }
        }, 1000); // Change speed here (1000ms per step)

        return () => clearInterval(interval);
    }, [traversalOrder, generateGraphElements]);

    useEffect(() => {
        generateGraphElements();
    }, [graph, generateGraphElements]);

    return (
        <div className="w-full h-[500px] bg-white shadow rounded p-4 mt-6">
            <h3 className="text-lg font-semibold mb-4">Graph Visualization (Animated BFS Traversal)</h3>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                attributionPosition="top-right"
            >
                <MiniMap />
                <Controls />
                <Background color="#aaa" gap={16} />
            </ReactFlow>

            {traversalOrder && (
                <div className="mt-4 text-center text-gray-700">
                    {traversalIndex < traversalOrder.length
                        ? `Currently visiting: ${traversalOrder[traversalIndex]}`
                        : 'Traversal complete!'}
                </div>
            )}
        </div>
    );
};

export default GraphVisualizer;