import React, { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, Table, TableHead,
    TableRow, TableCell, TableBody, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import axios from 'axios';

const AdminPanel = () => {
    const [assignments, setAssignments] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]); // ✅ preserve all
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    const [submissions, setSubmissions] = useState([]);
    const [newAssignment, setNewAssignment] = useState({
        title: '', description: '', input: '{}', expectedOutput: '', type: 'custom', difficulty: 'Medium'
    });

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewAssignment, setPreviewAssignment] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // instead of 5

    const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/admin/users', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            withCredentials: true
        }).then(res => setUsers(res.data));
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/assignments').then(res => {
            setAssignments(res.data);
            setAllAssignments(res.data); // ✅ Save all
        });
    }, []);

    useEffect(() => {
        let filtered = allAssignments;

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (difficultyFilter) {
            filtered = filtered.filter(a => a.difficulty === difficultyFilter);
        }

        setAssignments(filtered);
    }, [searchTerm, difficultyFilter, allAssignments]);

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

    const handleUpdateAssignment = async () => {
        try {
            const parsedInput = JSON.parse(newAssignment.input);
            const parsedExpected = JSON.parse(newAssignment.expectedOutput);

            await axios.put(`http://localhost:5000/admin/update-assignment/${newAssignment.id}`, {
                ...newAssignment,
                input: parsedInput,
                expectedOutput: parsedExpected
            });

            setAssignments(prev =>
                prev.map(a => (a.id === newAssignment.id ? { ...newAssignment, input: parsedInput, expectedOutput: parsedExpected } : a))
            );

            setNewAssignment({ title: '', description: '', input: '{}', expectedOutput: '', type: 'custom', difficulty: 'Medium' });
            setEditMode(false);
            alert('✅ Assignment updated!');
        } catch (err) {
            console.error(err);
            alert('❌ Update failed: Invalid JSON or server error.');
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

    const filteredSubmissions = selectedAssignmentFilter
        ? submissions.filter(s => s.assignmentId === selectedAssignmentFilter)
        : submissions;

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
                        {editMode ? (
                            <>
                                <Button variant="contained" color="primary" onClick={handleUpdateAssignment}>Save Changes</Button>
                                <Button variant="text" color="secondary" sx={{ ml: 2 }} onClick={() => {
                                    setNewAssignment({ title: '', description: '', input: '{}', expectedOutput: '', type: 'custom', difficulty: 'Medium' });
                                    setEditMode(false);
                                }}>Cancel</Button>
                            </>
                        ) : (
                            <Button variant="contained" onClick={handleAddAssignment}>Add Assignment</Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* View All Assignments */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Existing Assignments</Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Search by Title"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <Select
                            fullWidth
                            displayEmpty
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                        >
                            <MenuItem value="">Filter by Difficulty</MenuItem>
                            {difficultyOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>

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
                                        onClick={() => {
                                            setEditMode(true);
                                            setNewAssignment({
                                                ...a,
                                                input: JSON.stringify(a.input, null, 2),
                                                expectedOutput: JSON.stringify(a.expectedOutput, null, 2)
                                            });
                                        }}
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
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ ml: 1 }}
                                        onClick={() => {
                                            setPreviewAssignment(a);
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview
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

                <Button
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2, ml: 1 }}
                    onClick={() => {
                        const csv = [
                            ['Assignment', 'User', 'Score', 'Status', 'Time'],
                            ...submissions.map(s => [
                                s.assignmentId,
                                s.username,
                                s.score,
                                s.isCorrect ? 'Correct' : 'Incorrect',
                                new Date(s.time).toLocaleString()
                            ])
                        ]
                            .map(row => row.join(','))
                            .join('\n');

                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'submissions.csv';
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }}
                >
                    Download CSV
                </Button>

                <Select
                    fullWidth
                    displayEmpty
                    value={selectedAssignmentFilter}
                    onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="">Filter by Assignment</MenuItem>
                    {allAssignments.map((a) => (
                        <MenuItem key={a.id} value={a.id}>{a.title}</MenuItem>
                    ))}
                </Select>

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
                        {filteredSubmissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{s.assignmentId}</TableCell>
                                <TableCell>{s.username}</TableCell>
                                <TableCell>{s.score}</TableCell>
                                <TableCell>{s.isCorrect ? '✅ Correct' : '❌ Incorrect'}</TableCell>
                                <TableCell>{new Date(s.time).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}

                        {filteredSubmissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No submissions found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={filteredSubmissions.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]} // 👈 add this
                />

            </Paper>

            <Typography variant="h6" sx={{ mt: 6, mb: 2 }}>User List</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Registered</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((u, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{u.name || u.username}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{previewAssignment?.title}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>Description</Typography>
                    <Typography>{previewAssignment?.description}</Typography>

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Input</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: 12 }}>
                        <pre>{JSON.stringify(previewAssignment?.input, null, 2)}</pre>
                    </Paper>

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Expected Output</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: 12 }}>
                        <pre>{JSON.stringify(previewAssignment?.expectedOutput, null, 2)}</pre>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminPanel;
