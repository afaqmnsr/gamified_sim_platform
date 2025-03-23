import React from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';

// Utility function to check if algorithm expects complex structured input
const isComplexInputAlgorithm = (algoId) =>
    ['knapsackDP', 'lcsDP'].includes(algoId);

const CustomAlgorithmEditor = ({
    userCustomCode,
    setUserCustomCode,
    inputArray,
    setInputArray,
    graphInput,
    setGraphInput,
    startNode,
    setStartNode,
    selectedAlgorithm
}) => {

    const handleJsonInputChange = (e) => {
        try {
            const parsed = JSON.parse(e.target.value);
            setInputArray(parsed);
        } catch (err) {
            console.warn('Invalid JSON input');
        }
    };

    return (
        <Box>
            {/* Code Editor Title */}
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Algorithm Code Editor
            </Typography>

            {/* Code Editor */}
            <TextField
                label="Edit Algorithm Code"
                multiline
                minRows={15}
                fullWidth
                value={userCustomCode}
                onChange={(e) => setUserCustomCode(e.target.value)}
                margin="normal"
                variant="outlined"
                sx={{
                    fontFamily: 'monospace',
                    '& .MuiInputBase-root': {
                        fontSize: '14px'
                    }
                }}
            />

            {/* Inputs Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Input Configuration
                </Typography>

                <Grid container spacing={2}>

                    {/* Simple Array Input (Sorting Algorithms) */}
                    {['bubbleSort', 'quickSort', 'mergeSort', 'fibonacciDP'].includes(selectedAlgorithm) && (
                        <Grid item xs={12}>
                            <TextField
                                label={
                                    selectedAlgorithm === 'fibonacciDP'
                                        ? 'N Value (Single Number)'
                                        : 'Input Array (comma-separated)'
                                }
                                fullWidth
                                value={
                                    selectedAlgorithm === 'fibonacciDP'
                                        ? inputArray[0] ?? ''
                                        : inputArray.join(',')
                                }
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (selectedAlgorithm === 'fibonacciDP') {
                                        const num = Number(value.trim());
                                        if (!isNaN(num)) setInputArray([num]);
                                    } else {
                                        setInputArray(
                                            value
                                                .split(',')
                                                .map((val) => Number(val.trim()))
                                                .filter((val) => !isNaN(val))
                                        );
                                    }
                                }}
                            />
                        </Grid>
                    )}

                    {/* JSON Input (Structured Data Algorithms) */}
                    {isComplexInputAlgorithm(selectedAlgorithm) && (
                        <Grid item xs={12}>
                            <TextField
                                label="Structured Input (JSON format)"
                                multiline
                                minRows={6}
                                fullWidth
                                value={JSON.stringify(inputArray, null, 2)}
                                onChange={handleJsonInputChange}
                                helperText="Edit the JSON object for input data."
                            />
                        </Grid>
                    )}

                    {/* Graph Input for BFS */}
                    {selectedAlgorithm === 'bfs' && (
                        <>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    label="Graph (Adjacency List JSON)"
                                    multiline
                                    rows={5}
                                    fullWidth
                                    value={graphInput}
                                    onChange={(e) => setGraphInput(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Start Node"
                                    fullWidth
                                    value={startNode}
                                    onChange={(e) => setStartNode(e.target.value)}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default CustomAlgorithmEditor;