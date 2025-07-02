import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function Production() {
  const [productions, setProductions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const res = await axios.get('/api/production');
        setProductions(res.data);
      } catch (err) {
        setProductions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProductions();
  }, []);

  const filtered = productions.filter(
    (p) =>
      p.product?.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'product', headerName: 'Product', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Production
      </Typography>
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff', borderColor: '#e0e3e7' }}>
        <CardContent>
          <TextField
            label="Search by product or status"
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>
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