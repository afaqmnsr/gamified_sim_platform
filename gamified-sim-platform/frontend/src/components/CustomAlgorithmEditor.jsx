import React from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';

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
                    {/* Sorting Input Array */}
                    {['bubbleSort', 'quickSort', 'mergeSort'].includes(selectedAlgorithm) && (
                        <Grid item xs={12}>
                            <TextField
                                label="Input Array (comma-separated)"
                                fullWidth
                                value={inputArray.join(',')}
                                onChange={(e) =>
                                    setInputArray(
                                        e.target.value
                                            .split(',')
                                            .map((val) => Number(val.trim()))
                                            .filter((val) => !isNaN(val))
                                    )
                                }
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