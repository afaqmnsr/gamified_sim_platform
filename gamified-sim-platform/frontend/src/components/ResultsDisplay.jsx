import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent } from '@mui/material';

const ResultsDisplay = ({ selectedAlgorithm, results }) => {
    if (!results) return null;

    const getProgressValue = (value, isEnergy = false) => {
        // Normalize energy values separately if needed
        const parsed = parseFloat(value);
        return isEnergy ? Math.max(0, 100 - (parsed * 1000)) : Math.max(0, 100 - parsed);
    };

    return (
        <Card sx={{ width: '100%', maxWidth: '400px' }} elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Results
                </Typography>

                {selectedAlgorithm === 'bfs' ? (
                    <Typography><strong>Traversal Order:</strong> {results.traversalOrder?.join(', ') || 'N/A'}</Typography>
                ) : (
                    <Typography><strong>Sorted Array:</strong> {results.sortedArray?.join(', ') || 'N/A'}</Typography>
                )}

                <Box mt={2}>
                    <Typography variant="body2">Execution Time: {results.executionTime}</Typography>
                    <LinearProgress variant="determinate" value={getProgressValue(results.executionTime)} sx={{ mb: 1 }} />

                    <Typography variant="body2">Memory Usage: {results.memoryUsage}</Typography>
                    <LinearProgress variant="determinate" value={getProgressValue(results.memoryUsage)} sx={{ mb: 1 }} />

                    <Typography variant="body2">Energy Consumption: {results.energyConsumption}</Typography>
                    <LinearProgress variant="determinate" value={getProgressValue(results.energyConsumption, true)} />
                </Box>
            </CardContent>
        </Card>
    );
};

export default ResultsDisplay;