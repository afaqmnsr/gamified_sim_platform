import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Badges = ({ score }) => {
    const getBadge = () => {
        if (score > 90) return '🏆 Efficiency Master';
        if (score > 70) return '🥈 Optimizer';
        if (score > 50) return '🥉 Learner';
        return '🚀 Keep Improving!';
    };

    return (
        <Box mt={2} display="flex" alignItems="center" gap={1}>
            <EmojiEventsIcon color="warning" />
            <Typography variant="body1">Badge Earned:</Typography>
            <Chip label={getBadge()} color="primary" variant="outlined" />
        </Box>
    );
};

export default Badges;