import React from 'react';

const Badges = ({ score }) => {
    const getBadge = () => {
        if (score > 90) return '🏆 Efficiency Master';
        if (score > 70) return '🥈 Optimizer';
        if (score > 50) return '🥉 Learner';
        return '🚀 Keep Improving!';
    };

    return (
        <div className="mt-4 text-lg font-semibold">
            Badge Earned: {getBadge()}
        </div>
    );
};

export default Badges;