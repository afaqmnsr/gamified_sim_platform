import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import 'reactflow/dist/style.css';

const ProofGraphVisualizer = ({ proof }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        console.log("ProofGraphVisualizer received proof:", proof);

        if (!proof) return;

        const tempNodes = [];
        const tempEdges = [];

        if (proof.nodes && proof.edges && proof.coloring) {
            // Graph coloring proof for bipartite graphs
            proof.nodes.forEach((node, index) => {
                tempNodes.push({
                    id: node,
                    data: { label: `${node} (color ${proof.coloring[node]})` },
                    position: { x: 150 * index, y: 100 },
                    style: {
                        backgroundColor: proof.coloring[node] === 0 ? '#60a5fa' : '#f87171',
                        color: '#fff',
                        padding: 10
                    }
                });
            });

            proof.edges.forEach((edge, idx) => {
                tempEdges.push({
                    id: `edge-${idx}`,
                    source: edge.source,
                    target: edge.target
                });
            });

        } else if (proof.explanation) {
            tempNodes.push({
                id: 'proof',
                data: { label: proof.explanation },
                position: { x: 250, y: 150 },
                style: {
                    backgroundColor: '#34d399',
                    color: '#111827',
                    padding: 10
                }
            });
        } else {
            tempNodes.push({
                id: 'proof',
                data: { label: 'No visual proof available.' },
                position: { x: 250, y: 150 },
                style: {
                    backgroundColor: '#f87171',
                    color: '#fff',
                    padding: 10
                }
            });
        }

        setNodes(tempNodes);
        setEdges(tempEdges);
    }, [proof]);

    if (!proof) return null;

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Proof Visualization</Typography>
            <Box sx={{ height: '400px' }}>
                <ReactFlow nodes={nodes} edges={edges} fitView>
                    <MiniMap />
                    <Controls />
                    <Background color="#aaa" gap={16} />
                </ReactFlow>
            </Box>
        </Paper>
    );
};

export default ProofGraphVisualizer;