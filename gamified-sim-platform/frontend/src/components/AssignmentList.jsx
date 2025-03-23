import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, Button } from '@mui/material';

const AssignmentList = ({ onSelectAssignment }) => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/assignments').then((res) => {
            setAssignments(res.data);
        });
    }, []);

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Assignments</Typography>
            {assignments.map((assignment) => (
                <Paper key={assignment.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">{assignment.title}</Typography>
                    <Typography variant="body2">{assignment.description}</Typography>
                    <Typography variant="caption" color="secondary">
                        Difficulty: Medium
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => onSelectAssignment(assignment)}
                    >
                        Start Assignment
                    </Button>
                </Paper>
            ))}
        </Box>
    );
};

export default AssignmentList;
