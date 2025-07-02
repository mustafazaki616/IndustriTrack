import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, MenuItem, Select, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const statusOptions = ['All', 'Shipped', 'Delivered', 'In Transit'];

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await axios.get('/api/shipments');
        setShipments(res.data);
      } catch (err) {
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const filtered = shipments.filter((s) => {
    const matchesSearch = s.customer?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'All' || s.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'article', headerName: 'Article', flex: 1 },
    { field: 'sizeBreakdown', headerName: 'Size Breakdown', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1, renderCell: (params) => (
      <Button variant="outlined" size="small" sx={{ bgcolor: '#f5f7fa', color: '#222', border: 'none', fontWeight: 600, borderRadius: 2 }}>{params.value}</Button>
    ) },
    { field: 'totalUnits', headerName: 'Total Units', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 2,
      renderCell: () => (
        <Typography sx={{ color: '#1976d2', fontSize: 15, cursor: 'pointer' }}>
          View Invoice, Update Status, View Inspection
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#181c25' }}>
          Shipments
        </Typography>
        <Button variant="contained" sx={{ bgcolor: '#f5f7fa', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#e3e7ed' } }}>
          New Shipment
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search by customer"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: '#f5f7fa', borderRadius: 2, flex: 1 }}
        />
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          sx={{ bgcolor: '#f5f7fa', borderRadius: 2, minWidth: 120 }}
        >
          {statusOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>
      <Box sx={{ height: 500, width: '100%', bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e3e7' }}>
        <DataGrid
          rows={filtered}
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