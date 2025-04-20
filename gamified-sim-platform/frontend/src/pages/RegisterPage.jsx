import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Box, Button, Container, Paper, TextField, Typography, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            const res = await register(name, email, password);
            setMsg(res.message || 'Verification email sent!');
        } catch (err) {
            setMsg(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ pt: 10 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                    Register
                </Typography>

                {msg && (
                    <Typography color={msg.includes('failed') ? 'error' : 'primary'} sx={{ mb: 2 }}>
                        {msg}
                    </Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Name" value={name} required onChange={e => setName(e.target.value)} />
                    <TextField label="Email" value={email} type="email" required onChange={e => setEmail(e.target.value)} />
                    <TextField label="Password" value={password} type="password" required onChange={e => setPassword(e.target.value)} />
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Register'}
                    </Button>
                </Box>

                <Typography align="center" sx={{ mt: 2 }}>
                    Already have an account? <a href="/login">Login</a>
                </Typography>
            </Paper>
        </Container>
    );
};

export default RegisterPage;