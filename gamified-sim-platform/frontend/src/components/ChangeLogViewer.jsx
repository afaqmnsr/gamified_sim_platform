import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const ChangeLogViewer = ({ isAdmin = false, userId = '' }) => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    const fetchLogs = async (userId = '') => {
        const url = `http://localhost:5000/interaction-logs/${userId}`;
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setLogs(res.data);
    };

    const fetchUsers = async () => {
        const res = await axios.get('http://localhost:5000/admin/users', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setUsers(res.data);
    };

    useEffect(() => {
        fetchLogs(userId);
        if (isAdmin) fetchUsers();
    }, [userId]);

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        fetchLogs(e.target.value);
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Interaction Changelog</Typography>

            {isAdmin && (
                <Select
                    fullWidth
                    value={selectedUser}
                    onChange={handleUserChange}
                    displayEmpty
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="">-- Select User --</MenuItem>
                    {users.map(u => (
                        <MenuItem key={u._id} value={u._id}>
                            {u.name || u.username}
                        </MenuItem>
                    ))}
                </Select>
            )}

            <Paper sx={{ overflow: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Assignment</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Metadata</TableCell>
                            <TableCell>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, i) => (
                            <TableRow key={i}>
                                <TableCell>{log.assignmentId}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>
                                    <pre style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </TableCell>
                                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No logs to show
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default ChangeLogViewer;
