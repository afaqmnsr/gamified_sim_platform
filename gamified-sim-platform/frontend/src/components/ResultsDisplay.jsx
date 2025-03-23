import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent } from '@mui/material';

const ResultsDisplay = ({ selectedAlgorithm, results }) => {
    if (!results) return null;

    const getProgressValue = (value, isEnergy = false) => {
        const parsed = parseFloat(value);
        return isEnergy ? Math.max(0, 100 - parsed * 1000) : Math.max(0, 100 - parsed);
    };

    //  Result Value Display Logic
    const renderResultOutput = () => {
        if (selectedAlgorithm === 'bfs') {
            return (
                <Typography>
                    <strong>Traversal Order:</strong> {results.traversalOrder?.join(', ') || 'N/A'}
                </Typography>
            );
        }

        //  Sorting Algorithms return arrays
        if (
            ['bubbleSort', 'quickSort', 'mergeSort'].includes(selectedAlgorithm)
        ) {
            return (
                <Typography>
                    <strong>Sorted Array:</strong>{' '}
                    {Array.isArray(results.sortedArray)
                        ? results.sortedArray.join(', ')
                        : 'N/A'}
                </Typography>
            );
        }

        //  DP Algorithms (Fibonacci, Knapsack, LCS)
        if (['fibonacciDP', 'knapsackDP', 'lcsDP'].includes(selectedAlgorithm)) {
            return (
                <Typography>
                    <strong>Result:</strong>{' '}
                    {results.dpResult !== null
                        ? results.dpResult
                        : typeof results.sortedArray !== 'undefined'
                            ? results.sortedArray
                            : 'N/A'}
                </Typography>
            );
        }

        return <Typography>No output available</Typography>;
    };

    return (
        <Card sx={{ width: '100%', maxWidth: '500px' }} elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Results
                </Typography>

                {renderResultOutput()}

                <Box mt={2}>
                    <Typography variant="body2">
                        Execution Time: {results.executionTime}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={getProgressValue(results.executionTime)}
                        sx={{ mb: 1 }}
                    />

                    <Typography variant="body2">
                        Memory Usage: {results.memoryUsage}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={getProgressValue(results.memoryUsage)}
                        sx={{ mb: 1 }}
                    />

                    <Typography variant="body2">
                        Energy Consumption: {results.energyConsumption}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={getProgressValue(results.energyConsumption, true)}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default ResultsDisplay;