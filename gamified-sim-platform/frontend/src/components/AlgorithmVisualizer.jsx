import React, { useEffect, useState, useRef } from 'react';
import { Slider, Button, Box, Typography } from '@mui/material';

const AlgorithmVisualizer = ({ steps, initialArray, currentStep, setCurrentStep, dpMatrix }) => {

    const [playing, setPlaying] = useState(false);
    const intervalRef = useRef(null);

    const [array, setArray] = useState([...initialArray]);
    const [highlighted, setHighlighted] = useState([]);
    const [traversed, setTraversed] = useState([]);
    const [speed, setSpeed] = useState(500); // Default speed
    const timerRef = useRef(null);

    const MAX_BAR_HEIGHT = 180;

    const getNormalizedHeights = (arr) => {
        const max = Math.max(...arr, 1);
        return arr.map(val => (val / max) * MAX_BAR_HEIGHT);
    };

    const normalizedHeights = getNormalizedHeights(array);

    const handleStep = (stepIndex) => {
        if (!steps[stepIndex]) return;

        const step = steps[stepIndex];

        switch (step.type) {
            case 'swap':
            case 'merge':
            case 'update':
                setArray(step.array);
                setHighlighted(step.indices || []);
                break;
            case 'compare':
            case 'highlight':
                setHighlighted([step.i, step.j]);
                break;
            case 'visit':
                setTraversed(prev => [...prev, step.node]);
                break;
            case 'enqueue':
                setHighlighted([step.from, step.to]);
                break;
            case 'call':
            case 'memoize':
                // Console only for now
                break;
            case 'match':
            case 'mismatch':
                setHighlighted([`${step.i},${step.j}`]);
                break;
            case 'choice':
            case 'skip':
                setHighlighted([`${step.i},${step.w}`]);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        setArray([...initialArray]);
        setHighlighted([]);
        setTraversed([]);
        setCurrentStep(0);
        clearTimeout(timerRef.current);
    }, [steps, initialArray]);

    useEffect(() => {
        if (!playing || currentStep >= steps.length) return;

        timerRef.current = setTimeout(() => {
            handleStep(currentStep);
            setCurrentStep(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timerRef.current);
    }, [currentStep, speed, playing]);

    const handleRestart = () => {
        setCurrentStep(0);
        setArray([...initialArray]);
        setHighlighted([]);
        setTraversed([]);
    };

    const handleManualStep = (_, value) => {
        setPlaying(false); // pause auto-play
        clearTimeout(timerRef.current);
        setCurrentStep(value);
        handleStep(value);
    };

    return (
        <Box>
            {/* Bar Chart */}
            <Box display="flex" alignItems="flex-end" height={`${MAX_BAR_HEIGHT + 40}px`}>
                {normalizedHeights.map((height, index) => (
                    <Box key={index} textAlign="center" mx={0.5}>
                        <Box
                            sx={{
                                width: '20px',
                                height: `${height}px`,
                                backgroundColor: highlighted.includes(index) ? 'orange' : 'teal',
                                transition: 'all 0.3s ease-in-out',
                            }}
                        />
                        <Typography fontSize={12}>{array[index]}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Timeline Slider */}
            <Box mt={3}>
                <Typography variant="caption">Step: {currentStep} / {steps.length - 1}</Typography>
                <Slider
                    value={currentStep}
                    min={0}
                    max={steps.length - 1}
                    onChange={handleManualStep}
                    step={1}
                />
            </Box>

            {/* Speed Control */}
            <Box mt={2}>
                <Typography variant="caption">Speed: {speed}ms</Typography>
                <Slider
                    value={speed}
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(e, value) => setSpeed(value)}
                />
            </Box>

            {/* Rewind Button */}
            <Box mt={2}>
                <Button onClick={handleRestart} variant="outlined" color="secondary">
                    Restart Animation
                </Button>
            </Box>

            <Box mt={2}>
                <Button onClick={() => setPlaying(!playing)} variant="contained" color="primary">
                    {playing ? 'Pause' : 'Play'}
                </Button>
            </Box>

            {/* Traversal Info */}
            {traversed.length > 0 && (
                <Typography mt={2}>Visited: {traversed.join(', ')}</Typography>
            )}

            {/* DP Matrix Visualizer */}
            {dpMatrix && (
                <Box mt={4}>
                    <Typography variant="subtitle1">DP Matrix</Typography>
                    <Box display="inline-block" border="1px solid #ccc" p={1}>
                        {dpMatrix.map((row, i) => (
                            <Box key={i} display="flex">
                                {row.map((val, j) => (
                                    <Box
                                        key={j}
                                        width={30}
                                        height={30}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        border="1px solid #aaa"
                                        bgcolor={highlighted.includes(`${i},${j}`) ? 'orange' : 'white'}
                                        fontSize={12}
                                    >
                                        {val}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AlgorithmVisualizer;