import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Leaderboard = ({ scores }) => {
    return (
        <Card sx={{ width: '100%', maxWidth: '400px', mt: 4 }} elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Leaderboard
                </Typography>

                <List>
                    {scores
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5)
                        .map((entry, index) => (
                            <ListItem key={index}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze' }}>
                                        <EmojiEventsIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={entry.name || `Player ${index + 1}`}
                                    secondary={`${entry.score} pts`}
                                />
                            </ListItem>
                        ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default Leaderboard;