import React from 'react';

const Leaderboard = ({ scores }) => (
    <div className="mt-8 bg-white shadow rounded p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        <ul>
            {scores
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((entry, index) => (
                    <li key={index} className="mb-2">
                        <strong>{entry.name || `Player ${index + 1}`}</strong> - {entry.score} pts
                    </li>
                ))}
        </ul>
    </div>
);

export default Leaderboard;