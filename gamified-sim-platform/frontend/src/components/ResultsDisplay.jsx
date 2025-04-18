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
            const traversalData = results.traversalOrder || results.result?.traversalOrder;
            return (
                <Typography>
                    <strong>Traversal Order:</strong>{' '}
                    {Array.isArray(traversalData) ? traversalData.join(', ') : 'N/A'}
                </Typography>
            );
        }

        //  Sorting Algorithms return arrays
        if (['bubbleSort', 'quickSort', 'mergeSort'].includes(selectedAlgorithm)) {
            const array =
                Array.isArray(results.sortedArray)
                    ? results.sortedArray
                    : Array.isArray(results.sortedArray?.result)
                        ? results.sortedArray.result
                        : Array.isArray(results.result)
                            ? results.result
                            : null;

            return (
                <Typography>
                    <strong>Sorted Array:</strong>{' '}
                    {array ? array.join(', ') : 'N/A'}
                </Typography>
            );
        }

        // DP Algorithms (Fibonacci, Knapsack, LCS)
        if (['fibonacciDP', 'knapsackDP', 'lcsDP'].includes(selectedAlgorithm)) {
            const dpValue = results.result ?? results.customResult ?? results.dpResult;
            const hasMatrix = !!results.dpMatrix;

            return (
                <>
                    <Typography>
                        <strong>Result:</strong>{' '}
                        {typeof dpValue === 'object' ? JSON.stringify(dpValue) : dpValue ?? 'N/A'}
                    </Typography>

                    {hasMatrix && (
                        <Box mt={2}>
                            <Typography variant="subtitle1" gutterBottom>
                                DP Matrix:
                            </Typography>
                            {/* <pre style={{ fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto' }}>
                                {JSON.stringify(results.dpMatrix, null, 2)}
                            </pre> */}
                        </Box>
                    )}
                </>
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