import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

import { Box, Typography, Card, CardContent } from '@mui/material';

const GraphVisualizer = ({ graph, traversalOrder }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [traversalIndex, setTraversalIndex] = useState(0);

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
                    border: '1px solid #333'
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

    useEffect(() => {
        if (!traversalOrder || traversalOrder.length === 0) return;

        generateGraphElements();

        let index = 0;
        const interval = setInterval(() => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === traversalOrder[index]) {
                        return {
                            ...node,
                            style: {
                                ...node.style,
                                backgroundColor: '#4ade80',
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
        }, 1000);

        return () => clearInterval(interval);
    }, [traversalOrder, generateGraphElements]);

    useEffect(() => {
        generateGraphElements();
    }, [graph, generateGraphElements]);

    return (
        <Card sx={{ width: '100%', mt: 4 }} elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Graph Visualization (Animated BFS Traversal)
                </Typography>

                <Box sx={{ height: '500px', border: '1px solid #ccc', borderRadius: 1 }}>
                    <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="top-right">
                        <MiniMap />
                        <Controls />
                        <Background color="#aaa" gap={16} />
                    </ReactFlow>
                </Box>

                {traversalOrder && (
                    <Typography textAlign="center" mt={2} color="text.secondary">
                        {traversalIndex < traversalOrder.length
                            ? `Currently visiting: ${traversalOrder[traversalIndex]}`
                            : 'Traversal complete!'}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default GraphVisualizer;