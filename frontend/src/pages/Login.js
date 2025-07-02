import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, authenticateUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!form.email || !form.password) {
        throw new Error('Please fill in all fields');
      }
      const user = authenticateUser(form.email, form.password);
      if (user) {
        login({ username: user.username, email: user.email });
        navigate('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', height: 64, borderBottom: '1px solid #f0f2f5' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#181c25' }}>
          IndustriTrack
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, width: 400, maxWidth: '95vw', borderRadius: 3, boxShadow: '0 2px 12px #e3e7ed' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center', color: '#181c25' }}>
            Welcome to IndustriTrack
          </Typography>
          <form onSubmit={handleSubmit}>
            <Typography sx={{ mb: 1, fontWeight: 500 }}>Username or Email</Typography>
            <TextField
              name="email"
              type="text"
              placeholder="Enter your username or email"
              fullWidth
              size="medium"
              value={form.email}
              onChange={handleChange}
              sx={{ mb: 2, bgcolor: '#fff', borderRadius: 1 }}
              InputProps={{ style: { fontSize: 16 } }}
            />
            <Typography sx={{ mb: 1, fontWeight: 500 }}>Password</Typography>
            <TextField
              name="password"
              type="password"
              placeholder="Enter your password"
              fullWidth
              size="medium"
              value={form.password}
              onChange={handleChange}
              sx={{ mb: 3, bgcolor: '#fff', borderRadius: 1 }}
              InputProps={{ style: { fontSize: 16 } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#0080ff',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 3,
                py: 1.2,
                mb: 1.5,
                '&:hover': { bgcolor: '#005ecb' },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link href="/signup" underline="hover" sx={{ color: '#5a6b8a', fontSize: 15 }}>
                Don&apos;t have an account? Sign up
              </Link>
            </Box>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>
            )}
          </form>
        </Paper>
      </Box>
    </Box>
  );
} 