import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        setReports(res.data);
      } catch (err) {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'createdDate', headerName: 'Created Date', flex: 1 },
    { field: 'author', headerName: 'Author', flex: 1 },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Reports
      </Typography>
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff', borderColor: '#e0e3e7' }}>
        <CardContent>
          <TextField
            label="Search by title or type"
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