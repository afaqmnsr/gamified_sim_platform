import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Typography } from '@mui/material';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
dagreGraph.setGraph({ rankdir: 'TB' }); // top-to-bottom layout

const layoutNodesAndEdges = (nodes, edges) => {
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 60 });
    });
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
        const pos = dagreGraph.node(node.id);
        return {
            ...node,
            position: { x: pos.x, y: pos.y }
        };
    });
};


const AssignmentTree = ({ onSelectAssignment }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const fetchAssignments = async () => {
        const res = await axios.get('http://localhost:5000/assignments', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const assignments = res.data;

        const nodeMap = {};
        const newNodes = assignments.map((a, index) => {
            const position = { x: 100, y: 200 * index }; // consistent X, vertical Y stacking
            nodeMap[a.id] = { id: a.id, position };

            return {
                id: a.id,
                type: 'custom',
                data: { label: `${a.title} ${a.completed ? '✅' : ''}` },
                position,
                style: {
                    background: a.unlocked ? '#ffd54f' : '#eeeeee',
                    color: '#222',
                    border: '2px dashed #ff8f00',
                    borderRadius: '12px',
                    boxShadow: a.unlocked ? '3px 3px 5px rgba(0,0,0,0.3)' : 'none',
                    fontWeight: 'bold',
                    // fontFamily: 'Comic Sans MS, cursive, sans-serif',
                    padding: 10,
                    cursor: a.unlocked ? 'pointer' : 'not-allowed'
                },
            };
        });

        const newEdges = [];
        assignments.forEach((a) => {
            if (a.unlocksAfter) {
                a.unlocksAfter.forEach((dep) => {
                    newEdges.push({
                        id: `${dep}-${a.id}`,
                        source: dep,
                        target: a.id,
                        animated: true,
                        style: { stroke: '#888' }
                    });
                });
            }
        });

        // setNodes(newNodes);
        // setEdges(newEdges);

        const positionedNodes = layoutNodesAndEdges(newNodes, newEdges);
        setNodes(positionedNodes);
        setEdges(newEdges);

    };

    const CustomAssignmentNode = ({ data }) => (
        <div style={{ textAlign: 'center' }}>
            <img src="/cute-unlock-icon.svg" style={{ width: 40 }} />
            <div style={{ color: '#333' }}> {/* {fontFamily: 'Comic Sans MS'} */} 
                {data.label}
            </div>
        </div>
    );

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleReset = async () => {
        await axios.post('http://localhost:5000/reset-progress', {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        fetchAssignments();
    };

    const handleNodeClick = (_, node) => {
        const assignment = node.data.label;
        if (!assignment.includes('✅') && node.style?.cursor === 'not-allowed') return;
        onSelectAssignment({ id: node.id });
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Assignment Tree</Typography>
            <Button variant="outlined" color="error" onClick={handleReset}>Reset Progress</Button>

            <Box mt={4} sx={{ width: '100%', height: 500 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleNodeClick}
                    fitView
                    nodeTypes={{ custom: CustomAssignmentNode }}
                />
            </Box>
        </Box>
    );
};

export default AssignmentTree;