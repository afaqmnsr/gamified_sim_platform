import React from 'react';
import { Handle, Position } from 'reactflow';

const TransitionNode = ({ data }) => (
    <div style={{
        width: 20,
        height: 60,
        backgroundColor: '#10b981',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    }}>
        {data.label}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
);

export default TransitionNode;
