import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/customers');
        setCustomers(res.data);
      } catch (err) {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map(c => ({
    id: c.id,
    name: c.name || '',
    company: c.company || '',
    contact: c.contactPerson || '',
    email: c.email || '',
    phone: c.phone || '',
  }));

  const columns = [
    { field: 'name', headerName: 'Customer', flex: 1 },
    { field: 'company', headerName: 'Company', flex: 1 },
    { field: 'contact', headerName: 'Contact', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'shipments',
      headerName: 'Shipments',
      flex: 1,
      renderCell: (params) => (
        <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#181c25' }}>
          Customers
        </Typography>
        <Button variant="contained" sx={{ bgcolor: '#f5f7fa', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#e3e7ed' } }}>
          Add Customer
        </Button>
      </Box>
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff', borderColor: '#e0e3e7' }}>
        <CardContent>
          <TextField
            label="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>
      <Box sx={{ height: 500, width: '100%', bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e3e7' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[8]}
          loading={loading}
          disableSelectionOnClick
          sx={{
            border: 'none',
            fontSize: 16,
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f7fa', fontWeight: 700 },
            '& .MuiDataGrid-row': { bgcolor: '#fff' },
          }}
        />
      </Box>
    </Box>
  );
} 