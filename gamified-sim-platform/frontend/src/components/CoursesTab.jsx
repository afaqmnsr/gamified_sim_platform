import React, { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, MenuItem, Select, Table, TableHead, TableRow,
    TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axios from 'axios';

const CoursesTab = () => {
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [newCourse, setNewCourse] = useState({ name: '', description: '', instructor: '', students: [], assignments: [] });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
        axios.get('http://localhost:5000/admin/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setUsers(res.data));

        axios.get('http://localhost:5000/assignments', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setAssignments(res.data));
    }, []);

    const fetchCourses = () => {
        axios.get('http://localhost:5000/api/course', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setCourses(res.data));
    };

    const handleCreateCourse = async () => {
        try {
            await axios.post('http://localhost:5000/api/course/create', newCourse, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchCourses();
            setCreateDialogOpen(false);
            setNewCourse({ name: '', description: '', instructor: '', students: [], assignments: [] });
        } catch (err) {
            console.error(err);
            alert('Failed to create course');
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Courses</Typography>
                <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>+ Create Course</Button>
            </Box>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Instructor</TableCell>
                            <TableCell># Students</TableCell>
                            <TableCell># Assignments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map(course => (
                            <TableRow key={course._id}>
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.instructor?.username || '—'}</TableCell>
                                <TableCell>{course.students?.length || 0}</TableCell>
                                <TableCell>{course.assignments?.length || 0}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Create New Course</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="Course Name" fullWidth value={newCourse.name}
                                onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Description" fullWidth multiline minRows={2}
                                value={newCourse.description}
                                onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Instructor</Typography>
                            <Select
                                fullWidth value={newCourse.instructor}
                                onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                            >
                                {users.filter(u => u.role === 'admin').map(u => (
                                    <MenuItem key={u._id} value={u._id}>{u.username}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Students</Typography>
                            <Select
                                fullWidth multiple
                                value={newCourse.students}
                                onChange={(e) => setNewCourse(prev => ({ ...prev, students: e.target.value }))}
                                renderValue={(selected) => selected.map(id => {
                                    const user = users.find(u => u._id === id);
                                    return user?.username || id;
                                }).join(', ')}
                            >
                                {users.filter(u => u.role === 'student').map(u => (
                                    <MenuItem key={u._id} value={u._id}>{u.username}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Assignments</Typography>
                            <Select
                                fullWidth multiple
                                value={newCourse.assignments}
                                onChange={(e) => setNewCourse(prev => ({ ...prev, assignments: e.target.value }))}
                                renderValue={(selected) => selected.map(id => {
                                    const a = assignments.find(a => a.id === id);
                                    return a?.title || id;
                                }).join(', ')}
                            >
                                {assignments.map(a => (
                                    <MenuItem key={a.id} value={a.id}>{a.title}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCourse} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CoursesTab;
