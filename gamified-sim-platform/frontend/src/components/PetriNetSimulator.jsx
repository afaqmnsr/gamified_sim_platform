// PetriNetSimulator.jsx
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    MiniMap,
    Controls,
    Background,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Handle, Position,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Box, Button, Card, CardContent, Typography, TextField, Modal, MenuItem
} from '@mui/material';

import { PetriNet, Place, Transition, Arc } from '../utils/PetriNet';
import dagre from 'dagre';

const PetriNetSimulator = ({ setSnackbar }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [net, setNet] = useState(new PetriNet());
    const [transitionSequence, setTransitionSequence] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [firedTransitions, setFiredTransitions] = useState([]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'default' }, eds)), []);
    const resetReplay = () => setStepIndex(0);

    const addPlace = () => {
        const id = `P${nodes.filter(n => n.id.startsWith('P')).length + 1}`;
        const place = new Place(id, 1);
        net.addPlace(place);
        setNodes((nds) => [...nds, {
            id,
            data: { label: `${id} (🔵 1)` },
            position: { x: Math.random() * 300, y: Math.random() * 300 },
            type: 'default',
            style: { backgroundColor: '#3b82f6', color: 'white' }
        }]);
    };

    const addTransition = () => {
        const id = `T${nodes.filter(n => n.id.startsWith('T')).length + 1}`;
        const transition = new Transition(id);
        net.addTransition(transition);
        setNodes((nds) => [...nds, {
            id,
            data: { label: id },
            position: { x: Math.random() * 300, y: Math.random() * 300 },
            type: 'default',
            style: { backgroundColor: '#10b981', color: 'white' }
        }]);
    };

    const addArc = () => {
        if (!selectedSource || !selectedTarget) {
            setSnackbar("Please select both source and target nodes.", "warning");
            return;
        }

        const sourceNode = net.places.find(p => p.id === selectedSource) || net.transitions.find(t => t.id === selectedSource);
        const targetNode = net.places.find(p => p.id === selectedTarget) || net.transitions.find(t => t.id === selectedTarget);

        if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) {
            setSnackbar("Invalid source/target combination", "error");
            return;
        }

        const arcExists = edges.some(e => e.source === sourceNode.id && e.target === targetNode.id);
        if (arcExists) {
            setSnackbar("Arc already exists!", "info");
            return;
        }

        const arc = new Arc(sourceNode, targetNode);
        net.addArc(arc);

        setEdges((eds) => [...eds, {
            id: `arc-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'default'
        }]);

        setSelectedSource('');
        setSelectedTarget('');
        setSnackbar("Arc added!", "success");
    };

    const fireEnabledTransitions = () => {
        const enabled = net.getEnabledTransitions();
        if (enabled.length === 0) {
            setSnackbar("No enabled transitions", "info");
            return;
        }

        const newNet = net.clone();

        // ✨ Animate before firing
        enabled.forEach(t => {
            t.inputs.forEach(p => animateTokenTransfer(p.id, t.id));
            t.outputs.forEach(p => animateTokenTransfer(t.id, p.id));
        });

        // Then fire logic
        enabled.forEach(t => newNet.fire(t));

        setNet(newNet);
        updateNodeLabels(newNet);
        setFiredTransitions(prev => [...prev, ...enabled.map(t => t.id)]);
        setStepIndex(0);
        setSnackbar(`Fired ${enabled.length} transitions`, "success");
    };

    const fireNextTransition = () => {
        const enabled = net.getEnabledTransitions();
        if (enabled.length === 0 || stepIndex >= enabled.length) {
            setSnackbar("No more transitions to fire", "info");
            return;
        }

        const newNet = net.clone();
        const t = enabled[stepIndex];

        // ✨ Animate before firing
        t.inputs.forEach(p => animateTokenTransfer(p.id, t.id));
        t.outputs.forEach(p => animateTokenTransfer(t.id, p.id));

        // Then fire logic
        newNet.fire(t);

        const fired = t.id;
        setStepIndex(prev => prev + 1);
        setNet(newNet);
        updateNodeLabels(newNet);
        setFiredTransitions(prev => [...prev, fired]);
        setSnackbar(`Fired transition ${fired}`, "success");
    };

    const updateNodeLabels = (updatedNet) => {
        // In updateNodeLabels
        const enabledTransitions = updatedNet.getEnabledTransitions().map(t => t.id);

        setNodes((nds) => nds.map(n => {
            if (n.id.startsWith('P')) {
                const tokens = updatedNet.getPlace(n.id)?.tokens ?? 0;
                return {
                    ...n,
                    data: { label: `${n.id} (🔵 ${tokens})` },
                    style: { backgroundColor: '#3b82f6', color: 'white' }
                };
            } else if (n.id.startsWith('T')) {
                return {
                    ...n,
                    style: {
                        backgroundColor: '#10b981',
                        color: 'white',
                        boxShadow: enabledTransitions.includes(n.id)
                            ? '0 0 10px 5px #10b981aa'
                            : 'none',
                        transition: 'box-shadow 0.3s ease'
                    }
                };
            }
            return n;
        }));

    };

    const animateTokenTransfer = (fromId, toId) => {
        const tokenEl = document.createElement('div');
        tokenEl.textContent = '🔵';
        tokenEl.style.position = 'absolute';
        tokenEl.style.transition = 'all 0.6s ease';
        tokenEl.style.zIndex = 1000;

        const fromEl = document.querySelector(`[data-id="${fromId}"]`);
        const toEl = document.querySelector(`[data-id="${toId}"]`);
        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        tokenEl.style.left = `${fromRect.left + fromRect.width / 2}px`;
        tokenEl.style.top = `${fromRect.top + fromRect.height / 2}px`;

        document.body.appendChild(tokenEl);

        setTimeout(() => {
            tokenEl.style.left = `${toRect.left + toRect.width / 2}px`;
            tokenEl.style.top = `${toRect.top + toRect.height / 2}px`;
        }, 10);

        setTimeout(() => {
            tokenEl.remove();
        }, 600);
    };

    const layoutNodes = (nodes, edges) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: 'LR' });

        nodes.forEach(node => {
            dagreGraph.setNode(node.id, { width: 120, height: 60 });
        });

        edges.forEach(edge => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const newNodes = nodes.map(node => {
            const pos = dagreGraph.node(node.id);
            return {
                ...node,
                position: { x: pos.x, y: pos.y },
                sourcePosition: Position.Right,
                targetPosition: Position.Left
            };
        });

        return newNodes;
    };

    const PetriNetCanvas = ({
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect
    }) => {
        const { fitView } = useReactFlow();

        return (
            <>
                <Box sx={{ height: 450, border: '1px solid #ccc', borderRadius: 1 }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        panOnDrag
                        zoomOnScroll
                        zoomOnDoubleClick
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </Box>

                {/* 👉 Place outside to avoid overlap */}
                <Box display="flex" justifyContent="center" mt={2}>
                    <Button variant="outlined" onClick={fitView}>
                        Zoom to Fit
                    </Button>
                </Box>
            </>
        );
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Petri Net Simulator</Typography>

                <Box sx={{ height: 450, border: '1px solid #ccc', borderRadius: 1, mb: 2 }}>
                    <ReactFlowProvider>
                        <PetriNetCanvas
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                        />
                    </ReactFlowProvider>
                </Box>

                <Box display="flex" gap={2} justifyContent="center">
                    <Button variant="contained" onClick={addPlace}>Add Place</Button>
                    <Button variant="contained" color="success" onClick={addTransition}>Add Transition</Button>
                    {/* <Button variant="outlined" onClick={addArc}>Add Arc (P ➝ T)</Button> */}
                    <Button variant="contained" color="primary" onClick={fireEnabledTransitions}>Fire Enabled Transitions</Button>
                    <Button variant="outlined" color="secondary" onClick={fireNextTransition}>Step Fire</Button>
                    <Button variant="outlined" onClick={resetReplay}>Reset Step</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => setFiredTransitions([])}>
                        Clear Log
                    </Button>

                    {/* Auto Layout */}
                    <Button variant="outlined" onClick={() => setNodes(layoutNodes(nodes, edges))}>
                        Auto Layout
                    </Button>

                </Box>

                {/* Arc Selection Dropdowns */}
                <Box display="flex" gap={2} justifyContent="center" alignItems="center" mt={3} mb={1}>
                    <TextField
                        select
                        label="Source"
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        size="small"
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="">-- Source --</MenuItem>
                        {nodes.map(n => (
                            <MenuItem key={n.id} value={n.id}>
                                {n.id.startsWith('P') ? '🟦' : '🔶'} {n.id}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Target"
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                        size="small"
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="">-- Target --</MenuItem>
                        {nodes.map(n => (
                            <MenuItem key={n.id} value={n.id}>
                                {n.id.startsWith('P') ? '🟦' : '🔶'} {n.id}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button variant="outlined" onClick={addArc}>
                        Add Arc
                    </Button>
                </Box>

                {firedTransitions.length > 0 && (
                    <Box mt={3}>
                        <Typography variant="subtitle1" gutterBottom>
                            🔥 Fired Transitions Log:
                        </Typography>
                        <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 1, p: 2, maxHeight: 100, overflowY: 'auto' }}>
                            {firedTransitions.map((t, i) => (
                                <Typography variant="body2" key={i}>Step {i + 1}: {t}</Typography>
                            ))}
                        </Box>
                    </Box>
                )}

            </CardContent>
        </Card>
    );
};

export default PetriNetSimulator;
