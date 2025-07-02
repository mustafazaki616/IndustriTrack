import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!form.username || !form.email || !form.password || !form.confirmPassword) {
        throw new Error('Please fill in all fields');
      }
      if (form.password !== form.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (form.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.find(u => u.email === form.email);
      if (userExists) {
        throw new Error('User with this email already exists');
      }
      signup({ username: form.username, email: form.email, password: form.password });
      login({ username: form.username, email: form.email });
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', height: 64, borderBottom: '1px solid #f0f2f5' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#181c25' }}>
          IndustriTrack
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: 370, maxWidth: '90vw', bgcolor: 'transparent', p: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', color: '#181c25' }}>
            Create your account
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography sx={{ mb: 1, fontWeight: 500 }}>Username</Typography>
          <TextField
            name="username"
            placeholder="Enter your username"
            fullWidth
            size="medium"
            value={form.username}
            onChange={handleChange}
            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 1 }}
            InputProps={{ style: { fontSize: 16 } }}
          />
          <Typography sx={{ mb: 1, fontWeight: 500 }}>Email</Typography>
          <TextField
            name="email"
            type="email"
            placeholder="Enter your email"
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
            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 1 }}
            InputProps={{ style: { fontSize: 16 } }}
          />
          <Typography sx={{ mb: 1, fontWeight: 500 }}>Confirm Password</Typography>
          <TextField
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            fullWidth
            size="medium"
            value={form.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link href="/login" underline="hover" sx={{ color: '#5a6b8a', fontSize: 15 }}>
              Already have an account? Log in
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 