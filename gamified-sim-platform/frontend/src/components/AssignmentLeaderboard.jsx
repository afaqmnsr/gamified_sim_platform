import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const AssignmentLeaderboard = ({ assignmentId }) => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        if (assignmentId) {
            axios.get(`http://localhost:5000/assignment-leaderboard/${assignmentId}`)
                .then((res) => setLeaderboard(res.data));
        }
    }, [assignmentId]);

    if (!assignmentId) return null;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Leaderboard - {assignmentId}
            </Typography>
            <List>
                {leaderboard.map((entry, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`${index + 1}. ${entry.username}`}
                            secondary={`Score: ${entry.score}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default AssignmentLeaderboard;