import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from '@mui/material';

import { algorithms } from '../constants/predefinedAlgorithms';

const AlgorithmSelector = ({ selectedAlgorithm, handleAlgorithmSelect }) => {
    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Select Algorithm
            </Typography>

            <FormControl fullWidth>
                <InputLabel id="algorithm-label">Algorithm</InputLabel>
                <Select
                    labelId="algorithm-label"
                    value={selectedAlgorithm}
                    label="Algorithm"
                    onChange={(e) => handleAlgorithmSelect(e.target.value)}
                >
                    {algorithms.map((algo) => (
                        <MenuItem key={algo.id} value={algo.id}>
                            {algo.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default AlgorithmSelector;