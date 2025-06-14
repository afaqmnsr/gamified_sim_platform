import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, Button, LinearProgress } from '@mui/material';

const AssignmentList = ({ onSelectAssignment }) => {
    const [assignments, setAssignments] = useState([]);
    const completedCount = assignments.filter(a => a.completed).length;
    const totalCount = assignments.length;

    const fetchAssignments = async () => {
        const res = await axios.get('http://localhost:5000/assignments', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setAssignments(res.data);
    };

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

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Assignments</Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Progress: {completedCount}/{totalCount} completed
            </Typography>
            <LinearProgress variant="determinate" sx={{ mb: 2 }} value={(completedCount / totalCount) * 100} />

        
            <Button variant="outlined" color="error" sx={{ mb: 2, mt: 2 }} onClick={handleReset}>Reset Progress</Button>

            {assignments.map((assignment) => (
                <Paper key={assignment.id} sx={{ p: 2, mb: 2 }}>
                    {!assignment.unlocked && assignment.unlocksAfter?.length > 0 && (
                        <Typography color="error" variant="body2">
                            🔒 Complete "{assignment.unlocksAfter.join(', ')}" to unlock
                        </Typography>
                    )}
                    <Typography variant="h6">{assignment.title}</Typography>
                    <Typography variant="body2">{assignment.description}</Typography>
                    <Typography variant="caption" color="secondary">
                        Difficulty: {assignment.difficulty || 'Medium'}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => onSelectAssignment(assignment)}
                        disabled={!assignment.unlocked} // lock if not unlocked
                    >
                        {assignment.completed ? '✅ Completed' : 'Start Assignment'}
                    </Button>
                </Paper>
            ))}
        </Box>
    );
};

export default AssignmentList;
