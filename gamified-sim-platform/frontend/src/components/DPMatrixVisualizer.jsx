import React, { useEffect, useState } from 'react';
import { Box, Slider, Button, Typography } from '@mui/material';

const DPMatrixVisualizer = ({ dpMatrix = [], currentStep, highlightedCell }) => {
    const [step, setStep] = useState(currentStep || 0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(600);
    const [highlight, setHighlight] = useState({ i: -1, j: -1 });

    useEffect(() => {
        if (!dpMatrix || dpMatrix.length === 0) return;
        if (!playing) return;

        const timer = setTimeout(() => {
            setStep(prev => {
                const nextStep = prev + 1;
                if (nextStep >= dpMatrix.length * dpMatrix[0].length) {
                    setPlaying(false);
                    return prev;
                }
                return nextStep;
            });
        }, speed);

        return () => clearTimeout(timer);
    }, [step, playing, speed, dpMatrix]);

    useEffect(() => {
        if (highlightedCell) {
            setHighlight({ i: highlightedCell.i, j: highlightedCell.j });
        }
    }, [highlightedCell]);

    const handleRestart = () => {
        setStep(0);
        setHighlight({ i: -1, j: -1 });
        setPlaying(false);
    };

    const handleManualStep = (_, value) => {
        setStep(value);
        setHighlight({ i: -1, j: -1 }); // clear highlight for manual jump
    };

    if (!Array.isArray(dpMatrix) || dpMatrix.length === 0) {
        return <Typography>No matrix to show.</Typography>;
    }

    const totalSteps = dpMatrix.flat().length;

    return (
        <Box>
            <Typography variant="body2" gutterBottom>
                Step: {step} / {totalSteps - 1}
            </Typography>

            <Slider
                value={step}
                min={0}
                max={totalSteps - 1}
                step={1}
                onChange={handleManualStep}
                sx={{ mb: 2 }}
            />

            <Slider
                value={speed}
                min={100}
                max={2000}
                step={100}
                onChange={(e, v) => setSpeed(v)}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2} mb={2}>
                <Button variant="contained" onClick={() => setPlaying(!playing)}>
                    {playing ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outlined" onClick={handleRestart}>
                    Restart
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${dpMatrix[0].length}, 40px)`,
                    gap: '4px',
                    justifyContent: 'start',
                    overflowX: 'auto',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            >
                {dpMatrix.map((row, i) =>
                    row.map((cell, j) => {
                        const index = i * row.length + j;
                        const isVisible = index <= step;
                        const isActive = highlight.i === i && highlight.j === j;

                        return (
                            <Box
                                key={`${i}-${j}`}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isActive ? 'orange' : isVisible ? '#e0f7fa' : '#eee',
                                    border: '1px solid #ccc',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: isVisible ? 'black' : '#bbb',
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                {isVisible ? cell : ''}
                            </Box>
                        );
                    })
                )}
            </Box>
        </Box>
    );
};

export default DPMatrixVisualizer;