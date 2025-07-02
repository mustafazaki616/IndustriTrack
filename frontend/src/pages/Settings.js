import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent } from '@mui/material';

export default function Settings() {
  const [userEmail, setUserEmail] = useState('');
  const [stepName, setStepName] = useState('');
  const [timeline, setTimeline] = useState('');

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Settings
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        User Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Add User Email"
          placeholder="Enter email address"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          sx={{ flex: 1, bgcolor: '#f5f7fa', borderRadius: 2 }}
        />
        <Button variant="contained" sx={{ bgcolor: '#e3e7ed', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#bfc8d9' } }}>
          Add User
        </Button>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        T&A Steps
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Step Name"
          placeholder="Enter step name"
          value={stepName}
          onChange={e => setStepName(e.target.value)}
          sx={{ flex: 1, bgcolor: '#f5f7fa', borderRadius: 2 }}
        />
        <TextField
          label="Default Timeline (days)"
          placeholder="Enter default timeline"
          value={timeline}
          onChange={e => setTimeline(e.target.value)}
          sx={{ flex: 1, bgcolor: '#f5f7fa', borderRadius: 2 }}
        />
        <Button variant="contained" sx={{ bgcolor: '#e3e7ed', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#bfc8d9' } }}>
          Add Step
        </Button>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Data Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" sx={{ bgcolor: '#e3e7ed', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#bfc8d9' } }}>
          Backup Data
        </Button>
        <Button variant="contained" sx={{ bgcolor: '#e3e7ed', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#bfc8d9' } }}>
          Export Data
        </Button>
      </Box>
    </Box>
  );
} 