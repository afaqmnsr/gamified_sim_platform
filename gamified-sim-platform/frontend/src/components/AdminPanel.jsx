import React, { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, Table, TableHead,
    TableRow, TableCell, TableBody, Select, MenuItem
} from '@mui/material';
import axios from 'axios';

const AdminPanel = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [newAssignment, setNewAssignment] = useState({
        title: '', description: '', input: '{}', expectedOutput: '', type: 'custom', difficulty: 'Medium'
    });

    useEffect(() => {
        axios.get('http://localhost:5000/assignments').then(res => setAssignments(res.data));
    }, []);

    const handleAddAssignment = async () => {
        try {
            const parsedInput = JSON.parse(newAssignment.input);
            const parsedExpected = JSON.parse(newAssignment.expectedOutput);

            await axios.post('http://localhost:5000/admin/add-assignment', {
                ...newAssignment,
                input: parsedInput,
                expectedOutput: parsedExpected
            });

            // Optimistically update frontend state
            setAssignments(prev => [
                ...prev,
                {
                    ...newAssignment,
                    input: parsedInput,
                    expectedOutput: parsedExpected,
                    id: `${Date.now()}-${Math.random()}` // temp ID for UI
                }
            ]);

            setNewAssignment({
                title: '', description: '', input: '{}', expectedOutput: '', type: 'custom', difficulty: 'Medium'
            });

            alert('✅ Assignment added!');
        } catch (err) {
            console.error(err);
            alert('❌ Invalid JSON in Input or Expected Output. Please fix it and try again.');
        }
    };

    const handleDeleteAssignment = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/admin/delete-assignment/${id}`);
            setAssignments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete assignment.');
        }
    };

    const fetchSubmissions = () => {
        axios.get('http://localhost:5000/admin/submissions').then(res => setSubmissions(res.data));
    };

    const isValidJson = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    };

    const difficultyOptions = ['Easy', 'Medium', 'Hard'];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

            {/* Add Assignment Form */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6">Add New Assignment</Typography>
                <Grid container spacing={2}>
                    {['title', 'description'].map((field) => (
                        <Grid item xs={12} md={6} key={field}>
                            <TextField
                                label={field}
                                value={newAssignment[field]}
                                onChange={(e) => setNewAssignment({ ...newAssignment, [field]: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12} md={6}>
                        <Select
                            label="Type"
                            value={newAssignment.type}
                            onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="custom">Custom</MenuItem>
                            <MenuItem value="dp">DP</MenuItem>
                            <MenuItem value="graph">Graph</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Select
                            fullWidth
                            value={newAssignment.difficulty || ''}
                            onChange={(e) =>
                                setNewAssignment({ ...newAssignment, difficulty: e.target.value })
                            }
                        >
                            {difficultyOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Input (JSON)"
                            multiline
                            fullWidth
                            value={newAssignment.input}
                            onChange={(e) => {
                                const value = e.target.value;
                                setNewAssignment((prev) => ({ ...prev, input: value }));
                            }}
                            error={!!newAssignment.input && !isValidJson(newAssignment.input)}
                            helperText={!isValidJson(newAssignment.input) ? 'Invalid JSON!' : ''}
                            sx={{ mt: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Input Preview</Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: 12 }}>
                            <pre>{isValidJson(newAssignment.input) ? JSON.stringify(JSON.parse(newAssignment.input), null, 2) : 'Invalid JSON'}</pre>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Expected Output (JSON)"
                            multiline
                            fullWidth
                            value={newAssignment.expectedOutput}
                            onChange={(e) => setNewAssignment({ ...newAssignment, expectedOutput: e.target.value })}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Expected Output Preview</Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: 12 }}>
                            <pre>{isValidJson(newAssignment.expectedOutput) ? JSON.stringify(JSON.parse(newAssignment.expectedOutput), null, 2) : 'Invalid JSON'}</pre>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleAddAssignment}>Add Assignment</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* View All Assignments */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Existing Assignments</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell>{a.title}</TableCell>
                                <TableCell>{a.type}</TableCell>
                                <TableCell>{a.difficulty}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        onClick={() =>
                                            setNewAssignment({
                                                ...a,
                                                input: JSON.stringify(a.input, null, 2),
                                                expectedOutput: JSON.stringify(a.expectedOutput, null, 2)
                                            })
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        sx={{ ml: 1 }}
                                        onClick={() => handleDeleteAssignment(a.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Submission Review Table (outside the assignments table) */}
            <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6">Submission Reviews</Typography>
                <Button onClick={fetchSubmissions} variant="outlined" size="small" sx={{ mb: 2 }}>Refresh</Button>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Assignment</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {submissions.map((s, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{s.assignmentId}</TableCell>
                                <TableCell>{s.username}</TableCell>
                                <TableCell>{s.score}</TableCell>
                                <TableCell>{s.isCorrect ? '✅ Correct' : '❌ Incorrect'}</TableCell>
                                <TableCell>{new Date(s.time).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default AdminPanel;
