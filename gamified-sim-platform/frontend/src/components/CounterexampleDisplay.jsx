import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const CounterexampleDisplay = ({ counterexample }) => {
    if (!counterexample) return null;

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Counterexample Found!</Typography>
            <List>
                {Object.entries(counterexample).map(([key, value], idx) => (
                    <ListItem key={idx}>
                        <ListItemText primary={`${key}`} secondary={JSON.stringify(value)} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default CounterexampleDisplay;