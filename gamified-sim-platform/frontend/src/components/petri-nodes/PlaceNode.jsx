import React from 'react';
import { Handle, Position } from 'reactflow';

const PlaceNode = ({ data }) => (
    <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '3px solid #3b82f6',
        backgroundColor: '#e0f2ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: 14
    }}>
        {data.label}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
);

export default PlaceNode;
