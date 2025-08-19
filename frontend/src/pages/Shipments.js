import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, MenuItem, Select, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { apiGet, apiPost, apiPut } from '../api';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';

const statusOptions = [
  'Pending Approval',
  'Approved',
  'TRIMS IN HOUSE',
  'FABRIC ETA',
  'CUTTING',
  'STITCHING',
  'FINISHING',
  'PACKING',
  'OFFLINE',
  'INSPECTION', // Add INSPECTION as the 8th step
];
const statusSteps = statusOptions;

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({
    customer: '',
    article: '',
    sizeBreakdown: '',
    status: statusOptions[0],
    totalUnits: '',
    carrier: '',
    shippingAddress: '',
    shippingCost: '',
    estimatedDelivery: '',
    trackingNumber: '',
  });
  const [carrierFilter, setCarrierFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortModel, setSortModel] = useState([{ field: 'customer', sort: 'asc' }]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const data = await apiGet('/api/shipments');
        setShipments(Array.isArray(data) ? data : []);
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
    const matchesCarrier = carrierFilter === 'All' || (s.carrier || '').toLowerCase() === carrierFilter.toLowerCase();
    const matchesDate = !dateFilter || (s.estimatedDelivery && dayjs(s.estimatedDelivery).isSame(dayjs(dateFilter), 'day'));
    return matchesSearch && matchesStatus && matchesCarrier && matchesDate;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/shipments/${id}`, { ...shipments.find(s => s.id === id), status: newStatus });
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setSnackbar({ open: true, message: 'Status updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
    }
  };

  const handleRowClick = (params) => {
    setSelectedShipment(params.row);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedShipment(null);
  };

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewShipment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async () => {
    try {
      await axios.post('/api/shipments', newShipment);
      setSnackbar({ open: true, message: 'Shipment added!', severity: 'success' });
      setAddOpen(false);
      // Refresh
      const data = await apiGet('/api/shipments');
      setShipments(Array.isArray(data) ? data : []);
    } catch {
      setSnackbar({ open: true, message: 'Failed to add shipment.', severity: 'error' });
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Customer', 'Article', 'Size Breakdown', 'Status', 'Total Units', 'Carrier', 'Estimated Delivery', 'Tracking Number'],
      ...filtered.map(s => [s.customer, s.article, s.sizeBreakdown, s.status, s.totalUnits, s.carrier, s.estimatedDelivery, s.trackingNumber])
    ];
    const csv = csvRows.map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewInvoice = (shipment) => {
    setSelectedShipment(shipment);
    setInvoiceOpen(true);
  };

  const handleViewInspection = (shipment) => {
    setSelectedShipment(shipment);
    setInspectionOpen(true);
  };

  const handleInvoiceClose = () => setInvoiceOpen(false);
  const handleInspectionClose = () => setInspectionOpen(false);
  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'article', headerName: 'Article', flex: 1 },
    { field: 'sizeBreakdown', headerName: 'Size Breakdown', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            value={params.value}
            onChange={e => handleStatusChange(params.row.id, e.target.value)}
            size="small"
            sx={{ bgcolor: '#f5f7fa', color: '#222', border: 'none', fontWeight: 600, borderRadius: 2, minWidth: 120 }}
          >
            {statusOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Stepper activeStep={statusSteps.indexOf(params.value)} alternativeLabel sx={{ width: 120 }}>
            {statusSteps.map((label, idx) => (
              <Step key={label} completed={idx < statusSteps.indexOf(params.value)}>
                <StepLabel sx={{ fontSize: 10 }}>{''}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      ),
    },
    { field: 'totalUnits', headerName: 'Total Units', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="text" onClick={() => handleViewInvoice(params.row)} sx={{ color: '#1976d2', fontWeight: 600 }}>View Invoice</Button>
          <Button size="small" variant="text" onClick={() => handleViewInspection(params.row)} sx={{ color: '#1976d2', fontWeight: 600 }}>View Inspection</Button>
          <Button size="small" variant="text" onClick={() => { setSelectedShipment(params.row); setDetailsOpen(true); }} sx={{ color: '#1976d2', fontWeight: 600 }}>Details</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#181c25' }}>
          Shipments
        </Typography>
        <Button variant="contained" sx={{ bgcolor: '#f5f7fa', color: '#222', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#e3e7ed' } }} onClick={handleAddOpen}>
          New Shipment
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
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
          sx={{ bgcolor: '#f5f7fa', borderRadius: 2, flex: 1, minWidth: 180 }}
        />
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          sx={{ bgcolor: '#f5f7fa', borderRadius: 2, minWidth: 120 }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          {statusOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
        <TextField
          placeholder="Carrier"
          value={carrierFilter}
          onChange={e => setCarrierFilter(e.target.value)}
          sx={{ bgcolor: '#f5f7fa', borderRadius: 2, minWidth: 120 }}
        />
        <TextField
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          sx={{ bgcolor: '#f5f7fa', borderRadius: 2, minWidth: 150 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportCSV} sx={{ fontWeight: 600, minWidth: 120 }}>
          Export CSV
        </Button>
      </Box>
      <Box sx={{ height: 500, width: '100%', bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e3e7', overflowX: 'auto', '@media print': { height: 'auto', border: 'none' } }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[8]}
          loading={loading}
          disableSelectionOnClick
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          sx={{
            border: 'none',
            fontSize: 16,
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f7fa', fontWeight: 700 },
            '& .MuiDataGrid-row': { bgcolor: '#fff' },
            '@media print': {
              fontSize: 12,
              '& .MuiDataGrid-columnHeaders': { bgcolor: '#fff' },
              '& .MuiDataGrid-row': { bgcolor: '#fff' },
            },
          }}
        />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Shipment Details
          <IconButton onClick={handleDetailsClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedShipment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><b>Customer:</b> {selectedShipment.customer}</Typography>
              <Typography><b>Article:</b> {selectedShipment.article}</Typography>
              <Typography><b>Size Breakdown:</b> {selectedShipment.sizeBreakdown}</Typography>
              <Typography><b>Status:</b> {selectedShipment.status}</Typography>
              <Typography><b>Total Units:</b> {selectedShipment.totalUnits}</Typography>
              <Typography><b>Carrier:</b> {selectedShipment.carrier}</Typography>
              <Typography><b>Shipping Address:</b> {selectedShipment.shippingAddress}</Typography>
              <Typography><b>Shipping Cost:</b> {selectedShipment.shippingCost}</Typography>
              <Typography><b>Estimated Delivery:</b> {selectedShipment.estimatedDelivery}</Typography>
              <Typography><b>Tracking Number:</b> {selectedShipment.trackingNumber}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Shipment
          <IconButton onClick={handleAddClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Customer" name="customer" value={newShipment.customer} onChange={handleAddChange} fullWidth required />
            <TextField label="Article" name="article" value={newShipment.article} onChange={handleAddChange} fullWidth required />
            <TextField label="Size Breakdown" name="sizeBreakdown" value={newShipment.sizeBreakdown} onChange={handleAddChange} fullWidth />
            <Select label="Status" name="status" value={newShipment.status} onChange={handleAddChange} fullWidth>
              {statusOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
            <TextField label="Total Units" name="totalUnits" value={newShipment.totalUnits} onChange={handleAddChange} fullWidth type="number" />
            <TextField label="Carrier" name="carrier" value={newShipment.carrier} onChange={handleAddChange} fullWidth />
            <TextField label="Shipping Address" name="shippingAddress" value={newShipment.shippingAddress} onChange={handleAddChange} fullWidth />
            <TextField label="Shipping Cost" name="shippingCost" value={newShipment.shippingCost} onChange={handleAddChange} fullWidth type="number" />
            <TextField label="Estimated Delivery" name="estimatedDelivery" value={newShipment.estimatedDelivery} onChange={handleAddChange} fullWidth type="date" InputLabelProps={{ shrink: true }} />
            <TextField label="Tracking Number" name="trackingNumber" value={newShipment.trackingNumber} onChange={handleAddChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit}>Add Shipment</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={invoiceOpen} onClose={handleInvoiceClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Invoice
          <IconButton onClick={handleInvoiceClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedShipment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Invoice for {selectedShipment.customer}</Typography>
              <Typography><b>Order ID:</b> {selectedShipment.orderId || 'N/A'}</Typography>
              <Typography><b>Article:</b> {selectedShipment.article}</Typography>
              <Typography><b>Total Units:</b> {selectedShipment.totalUnits}</Typography>
              <Typography><b>Status:</b> {selectedShipment.status}</Typography>
              <Typography><b>Carrier:</b> {selectedShipment.carrier}</Typography>
              <Typography><b>Shipping Address:</b> {selectedShipment.shippingAddress}</Typography>
              <Typography><b>Shipping Cost:</b> {selectedShipment.shippingCost}</Typography>
              <Typography><b>Estimated Delivery:</b> {selectedShipment.estimatedDelivery}</Typography>
              <Typography><b>Tracking Number:</b> {selectedShipment.trackingNumber}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint}>Print</Button>
          <Button onClick={handleInvoiceClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={inspectionOpen} onClose={handleInspectionClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Inspection Details
          <IconButton onClick={handleInspectionClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedShipment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Inspection for {selectedShipment.customer}</Typography>
              <Typography><b>Order ID:</b> {selectedShipment.orderId || 'N/A'}</Typography>
              <Typography><b>Article:</b> {selectedShipment.article}</Typography>
              <Typography><b>Status:</b> {selectedShipment.status}</Typography>
              <Typography><b>Inspection Date:</b> 2024-07-10</Typography>
              <Typography><b>Inspector:</b> John Doe</Typography>
              <Typography><b>Result:</b> Passed</Typography>
              <Typography><b>Notes:</b> All items meet quality standards.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint}>Print</Button>
          <Button onClick={handleInspectionClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}