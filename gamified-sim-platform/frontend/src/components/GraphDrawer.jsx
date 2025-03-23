import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    ReactFlowProvider,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow';

import {
    Box,
    Button,
    Typography,
    Modal,
    TextField
} from '@mui/material';

import 'reactflow/dist/style.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
};

// Move nodeTypes and edgeTypes outside component if needed in future
const GraphDrawer = ({ open, handleClose, onGraphSave }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    // Memoize nodeTypes/edgeTypes if you define them
    const nodeTypes = useMemo(() => ({}), []);
    const edgeTypes = useMemo(() => ({}), []);

    // ✅ Handle node position changes
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // ✅ Handle edge changes
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const handleSaveGraph = () => {
        const adjacencyList = {};

        nodes.forEach((node) => {
            adjacencyList[node.id] = [];
        });

        edges.forEach((edge) => {
            if (adjacencyList[edge.source]) {
                adjacencyList[edge.source].push(edge.target);
            }
        });

        // Return JSON structure to parent
        onGraphSave(adjacencyList);

        // Close modal
        handleClose();
    };

    const addNewNode = () => {
        const newNode = {
            id: (nodes.length + 1).toString(),
            data: { label: `Node ${nodes.length + 1}` },
            position: {
                x: Math.random() * 400,
                y: Math.random() * 400
            },
            style: {
                backgroundColor: '#60a5fa',
                color: '#fff'
            }
        };

        setNodes((nds) => [...nds, newNode]);
    };

    const resetGraph = () => {
        setNodes([]);
        setEdges([]);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" mb={2}>
                    Draw Custom Graph
                </Typography>

                <ReactFlowProvider>
                    <Box sx={{ height: '80%', width: '100%', mb: 2, border: '1px solid #ccc' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                        >
                            <MiniMap />
                            <Controls />
                            <Background />
                        </ReactFlow>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                        <Button variant="contained" color="primary" onClick={addNewNode}>
                            Add Node
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={resetGraph}>
                            Reset
                        </Button>
                        <Button variant="contained" color="success" onClick={handleSaveGraph}>
                            Save Graph
                        </Button>
                    </Box>
                </ReactFlowProvider>
            </Box>
        </Modal>
    );
};

export default GraphDrawer;