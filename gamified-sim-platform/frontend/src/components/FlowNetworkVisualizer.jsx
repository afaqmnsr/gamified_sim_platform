
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const getEdgeId = (from, to) => `${from}-${to}`;
export const nodeTypes = {};
export const edgeTypes = {};

const FlowNetworkVisualizer = ({ graph, steps, currentStep, setCurrentStep }) => {

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [flowMap, setFlowMap] = useState({});
    const [highlightedEdges, setHighlightedEdges] = useState({});

    const layoutGraph = useMemo(() => {
        const levels = {};
        const visited = new Set();

        const dfs = (node, depth) => {
            if (visited.has(node)) return;
            visited.add(node);
            levels[node] = depth;
            const neighbors = Array.isArray(graph[node]) ? graph[node] : [];
            for (let neighbor of neighbors) {
                dfs(neighbor.to, depth + 1);
            }
        };

        dfs(Object.keys(graph)[0], 0);
        return levels;
    }, [graph]);

    const initNodesAndEdges = useCallback(() => {
        const allNodes = Object.keys(graph).map((id, i) => ({
            id,
            data: { label: id },
            position: { x: (layoutGraph[id] !== undefined ? layoutGraph[id] : 0) * 150, y: i * 100 },
            style: {
                padding: 10,
                border: '1px solid #555',
                borderRadius: 5,
                background: '#fff'
            }
        }));

        const allEdges = [];
        Object.entries(graph).forEach(([from, neighbors]) => {
            if (!Array.isArray(neighbors)) return; // <-- Skip if not an array

            neighbors.forEach(({ to, capacity }) => {
                const edgeId = getEdgeId(from, to);
                allEdges.push({
                    id: edgeId,
                    source: from,
                    target: to,
                    label: `0/${capacity}`,
                    type: 'default',
                    animated: false,
                    style: { strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: '#555',
                    }
                });
            });
        });

        setNodes(allNodes);
        setEdges(allEdges);
        setFlowMap({});
        setHighlightedEdges({});
        setCurrentStep(0);
    }, [graph, layoutGraph]);

    useEffect(() => {
        initNodesAndEdges();
    }, [initNodesAndEdges]);

    useEffect(() => {
        if (currentStep === 0) {
            initNodesAndEdges();
        }
    }, [currentStep]);

    const applyStep = useCallback((step) => {
        if (!step) return;

        if (step.type === 'explore') {
            setHighlightedEdges(prev => ({
                ...prev,
                [getEdgeId(step.from, step.to)]: 'orange'
            }));
        }

        if (step.type === 'augment') {
            const edgeId = getEdgeId(step.from, step.to);

            setFlowMap(prev => {
                const newFlow = (prev[edgeId] || 0) + step.flow;
                return {
                    ...prev,
                    [edgeId]: newFlow
                };
            });

            setHighlightedEdges(prev => ({
                ...prev,
                [edgeId]: 'green'
            }));
        }
    }, []);

    useEffect(() => {
        if (!steps || currentStep >= steps.length) return;
        applyStep(steps[currentStep]);
    }, [steps, currentStep]);

    const animatedEdges = useMemo(() => {
        return edges.map(edge => {
            const edgeId = getEdgeId(edge.source, edge.target);
            const flow = flowMap[edgeId] || 0;
            const original = graph[edge.source].find(e => e.to === edge.target);
            const capacity = original?.capacity ?? '?';

            return {
                ...edge,
                label: `${flow}/${capacity}`,
                animated: highlightedEdges[edgeId] === 'green',
                style: {
                    ...edge.style,
                    stroke: highlightedEdges[edgeId] || '#888',
                },
            };
        });
    }, [edges, flowMap, highlightedEdges, graph]);

    useEffect(() => {
        console.log('Edges updated:', animatedEdges);
    }, [animatedEdges]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleReset = () => {
        initNodesAndEdges();
        setCurrentStep(0); // <-- must call parent's setter
    };

    return (
        <div style={{ height: 500, width: '100%' }}>
            <ReactFlow
                key={currentStep} // Force rerender on step change
                nodes={nodes}
                edges={animatedEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <button onClick={handleNext}>▶️ Next Step ({currentStep + 1}/{steps.length})</button>
                <button onClick={handleReset}>🔁 Reset</button>
            </div>
        </div>
    );
};

export default FlowNetworkVisualizer;
