import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Card, CardContent, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Function to get query parameters from URL
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default function Reports() {
  const query = useQuery();
  const productionId = query.get('productionId');
  
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [editedReport, setEditedReport] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        setReports(res.data);
        
        // If productionId is provided, find and highlight that report
        if (productionId) {
          const report = res.data.find(r => r.productionId === productionId);
          if (report) {
            setCurrentReport(report);
            setViewDialogOpen(true);
          }
        }
      } catch (err) {
        setReports([]);
        setSnackbar({ open: true, message: 'Failed to load reports', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [productionId]);
  
  const handleViewReport = (report) => {
    setCurrentReport(report);
    setViewDialogOpen(true);
  };
  
  const handleEditReport = (report) => {
    setCurrentReport(report);
    setEditedReport({...report});
    setEditDialogOpen(true);
  };
  
  const handlePrintReport = (report) => {
    setCurrentReport(report);
    // Open in a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Report: ${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Report: ${report.title}</h1>
          <div class="section">
            <p><span class="label">ID:</span> ${report.id}</p>
            <p><span class="label">Type:</span> ${report.type}</p>
            <p><span class="label">Created Date:</span> ${report.createdDate}</p>
            <p><span class="label">Author:</span> ${report.author}</p>
          </div>
          <div class="section">
            <h2>Content</h2>
            <p>${report.content || 'No content available'}</p>
          </div>
          ${report.data ? `
          <div class="section">
            <h2>Data</h2>
            <table>
              <tr>
                ${Object.keys(report.data).map(key => `<th>${key}</th>`).join('')}
              </tr>
              <tr>
                ${Object.values(report.data).map(value => `<td>${value}</td>`).join('')}
              </tr>
            </table>
          </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  const handleSaveEdit = async () => {
    try {
      // Save the edited report
      await axios.put(`/api/reports/${editedReport.id}`, editedReport);
      
      // Update the reports list
      const updatedReports = reports.map(r => 
        r.id === editedReport.id ? editedReport : r
      );
      setReports(updatedReports);
      
      setSnackbar({ open: true, message: 'Report updated successfully', severity: 'success' });
      setEditDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update report', severity: 'error' });
    }
  };

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
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleViewReport(params.row)} size="small" title="View Report">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleEditReport(params.row)} size="small" title="Edit Report">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handlePrintReport(params.row)} size="small" title="Print Report">
            <PrintIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
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
      
      {/* View Report Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Report Details
          <IconButton
            aria-label="close"
            onClick={() => setViewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentReport && (
            <Box>
              <Typography variant="h6" gutterBottom>{currentReport.title}</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>ID:</strong> {currentReport.id}</Typography>
                <Typography><strong>Type:</strong> {currentReport.type}</Typography>
                <Typography><strong>Created Date:</strong> {currentReport.createdDate}</Typography>
                <Typography><strong>Author:</strong> {currentReport.author}</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Content</Typography>
              <Typography paragraph>{currentReport.content || 'No content available'}</Typography>
              
              {currentReport.data && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Data</Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    {Object.entries(currentReport.data).map(([key, value]) => (
                      <Typography key={key}><strong>{key}:</strong> {value}</Typography>
                    ))}
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {currentReport && (
            <>
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleEditReport(currentReport);
              }} color="primary">
                Edit
              </Button>
              <Button onClick={() => handlePrintReport(currentReport)} color="primary">
                Print
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Edit Report Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Report
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editedReport && (
            <Box>
              <TextField
                label="Title"
                value={editedReport.title}
                onChange={(e) => setEditedReport({...editedReport, title: e.target.value})}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Type"
                value={editedReport.type}
                onChange={(e) => setEditedReport({...editedReport, type: e.target.value})}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Content"
                value={editedReport.content || ''}
                onChange={(e) => setEditedReport({...editedReport, content: e.target.value})}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}