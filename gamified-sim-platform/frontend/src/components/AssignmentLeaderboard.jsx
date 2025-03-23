import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Trophy icon for top scorers

const AssignmentLeaderboard = ({ assignmentId, reloadTrigger }) => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        if (assignmentId) {
            axios
                .get(`http://localhost:5000/assignment-leaderboard/${assignmentId}`)
                .then((res) => setLeaderboard(res.data))
                .catch((err) => console.error('Failed to fetch leaderboard:', err));
        }
    }, [assignmentId, reloadTrigger]); // ✅ triggers refresh when reloadTrigger changes

    if (!assignmentId) return null;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Leaderboard - {assignmentId}
            </Typography>

            {leaderboard.length === 0 ? (
                <Typography>No submissions yet! Be the first to submit.</Typography>
            ) : (
                <List>
                    {leaderboard.map((entry, index) => (
                        <ListItem key={index} divider>
                            <ListItemAvatar>
                                {index === 0 ? (
                                    <Avatar sx={{ bgcolor: 'gold' }}>
                                        <EmojiEventsIcon />
                                    </Avatar>
                                ) : (
                                    <Avatar>{entry.username.charAt(0).toUpperCase()}</Avatar>
                                )}
                            </ListItemAvatar>

                            <ListItemText
                                primary={`${index + 1}. ${entry.username}`}
                                secondary={`Score: ${entry.score} | Time: ${new Date(entry.time).toLocaleString()}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default AssignmentLeaderboard;