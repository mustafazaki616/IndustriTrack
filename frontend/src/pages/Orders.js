import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Snackbar, Alert, Tooltip, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import { apiPost, apiGet, apiPut, apiDelete } from '../api';

const emptyOrder = {
  customer: '',
  article: '',
  sizes: '', // JSON string for editing
  totalQuantity: '',
  status: '',
  price: '',
  notes: '',
};

const PRODUCTION_STAGES = [
  'TRIMS IN HOUSE',
  'FABRIC ETA',
  'CUTTING',
  'STITCHING',
  'FINISHING',
  'PACKING',
  'OFFLINE',
  'INSPECTION'
];

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState(emptyOrder);
  const [detailsIdx, setDetailsIdx] = useState(-1);
  const [sending, setSending] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [tnaDialog, setTnaDialog] = useState({ open: false, orderId: null });
  const [stageDurations, setStageDurations] = useState(PRODUCTION_STAGES.map(() => ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await apiGet('/api/orders');
      setOrders(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching orders', severity: 'error' });
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleOpen = (idx = -1) => {
    setEditIdx(idx);
    if (idx >= 0) {
      const o = orders[idx];
      setForm({
        customer: o.customer || '',
        article: o.article || '',
        sizes: o.sizes ? JSON.stringify(o.sizes) : '',
        totalQuantity: o.totalQuantity || '',
        status: o.status || '',
        price: o.price || '',
        notes: o.notes || '',
      });
    } else {
      setForm({ ...emptyOrder, status: 'Pending Production' });
    }
    setErrors({});
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleDetailsOpen = idx => setDetailsIdx(idx);
  const handleDetailsClose = () => setDetailsIdx(-1);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.customer) errs.customer = 'Customer is required';
    if (!form.article) errs.article = 'Article is required';
    if (!form.totalQuantity || isNaN(Number(form.totalQuantity))) errs.totalQuantity = 'Total quantity must be a number';
    if (form.sizes) {
      try { JSON.parse(form.sizes); } catch { errs.sizes = 'Sizes must be valid JSON'; }
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      customer: form.customer,
      article: form.article,
      sizes: form.sizes ? JSON.parse(form.sizes) : {},
      totalQuantity: Number(form.totalQuantity),
      status: form.status,
      price: form.price ? Number(form.price) : null,
      notes: form.notes,
    };
    try {
      if (editIdx >= 0) {
        await apiPut(`/api/orders/${orders[editIdx].id}`, { ...payload, id: orders[editIdx].id });
        setSnackbar({ open: true, message: 'Order updated', severity: 'success' });
      } else {
        await apiPost('/api/orders', payload);
        setSnackbar({ open: true, message: 'Order created', severity: 'success' });
      }
      setOpen(false);
      fetchOrders();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving order', severity: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await apiDelete(`/api/orders/${id}`);
      setSnackbar({ open: true, message: 'Order deleted', severity: 'success' });
      setOrders(orders.filter(order => order.id !== id));
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting order', severity: 'error' });
    }
  };

  const handleSendToProduction = async (orderId) => {
    setSending(orderId);
    try {
      await apiPost(`/api/production/start/${orderId}`);
      setSnackbar({ open: true, message: 'Sent to production', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to start production', severity: 'error' });
    } finally {
      setSending(null);
    }
  };

  const handleOpenTnaDialog = (orderId) => {
    setStageDurations(PRODUCTION_STAGES.map(() => ''));
    setTnaDialog({ open: true, orderId });
  };
  const handleCloseTnaDialog = () => setTnaDialog({ open: false, orderId: null });

  const handleDurationChange = (idx, value) => {
    const arr = [...stageDurations];
    arr[idx] = value.replace(/[^0-9]/g, '');
    setStageDurations(arr);
  };

  const handleSendToProductionWithTna = async () => {
    setSending(tnaDialog.orderId);
    try {
      const durations = PRODUCTION_STAGES.map((stage, idx) => ({ name: stage, expectedDays: Number(stageDurations[idx] || 0) }));
      await apiPost(`/api/production/start/${tnaDialog.orderId}`, { stages: durations });
      setSnackbar({ open: true, message: 'Sent to production', severity: 'success' });
      fetchOrders();
      handleCloseTnaDialog();
      // Navigate to the production page after sending to production
      navigate('/production');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to start production', severity: 'error' });
    } finally {
      setSending(null);
    }
  };

  // Filter orders based on search term and field
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    if (searchField === 'id') {
      return order.id.toString().includes(term);
    } else if (searchField === 'customer') {
      return order.customer?.toLowerCase().includes(term);
    } else if (searchField === 'article') {
      return order.article?.toLowerCase().includes(term);
    } else {
      // Search in all fields
      return (
        order.id.toString().includes(term) ||
        order.customer?.toLowerCase().includes(term) ||
        order.article?.toLowerCase().includes(term) ||
        order.status?.toLowerCase().includes(term)
      );
    }
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Orders</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Button variant="contained" onClick={() => handleOpen()}>Add Order</Button>
        <TextField 
          label="Search Orders" 
          variant="outlined" 
          size="small" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Search Field"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Fields</MenuItem>
          <MenuItem value="id">Order ID</MenuItem>
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="article">Article</MenuItem>
        </TextField>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Article</TableCell>
              <TableCell>Sizes</TableCell>
              <TableCell>Total Qty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.article}</TableCell>
                <TableCell>
                  <Tooltip title={JSON.stringify(row.sizes)}><span>{row.sizes ? Object.entries(row.sizes).map(([k,v]) => `${k}:${v}`).join(', ') : ''}</span></Tooltip>
                </TableCell>
                <TableCell>{row.totalQuantity}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={
                      row.status === 'In Production' ? 'warning' :
                      row.status === 'Pending Production' ? 'default' :
                      row.status === 'Completed' ? 'success' :
                      row.status === 'Inspection' ? 'info' :
                      row.status === 'Shipped' ? 'primary' :
                      undefined
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.notes}</TableCell>
                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                <TableCell>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : ''}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDetailsOpen(idx)}><InfoIcon /></IconButton>
                  <IconButton onClick={() => handleOpen(idx)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                  {row.status === 'Pending Production' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1, fontWeight: 600 }}
                      onClick={() => handleOpenTnaDialog(row.id)}
                      disabled={sending === row.id}
                    >
                      {sending === row.id ? 'Sending...' : 'Send to Production'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Edit/Add Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disablePortal>
        <DialogTitle>{editIdx >= 0 ? 'Edit' : 'Add'} Order</DialogTitle>
        <DialogContent>
          <TextField label="Customer" name="customer" value={form.customer} onChange={handleChange} fullWidth margin="dense" error={!!errors.customer} helperText={errors.customer} />
          <TextField label="Article" name="article" value={form.article} onChange={handleChange} fullWidth margin="dense" error={!!errors.article} helperText={errors.article} />
          <TextField label="Sizes (JSON)" name="sizes" value={form.sizes} onChange={handleChange} fullWidth margin="dense" error={!!errors.sizes} helperText={errors.sizes || 'e.g. {"M":10,"L":5}'} />
          <TextField label="Total Quantity" name="totalQuantity" value={form.totalQuantity} onChange={handleChange} fullWidth margin="dense" error={!!errors.totalQuantity} helperText={errors.totalQuantity} />
          <TextField label="Status" name="status" value={form.status} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Price" name="price" value={form.price} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Details Dialog */}
      <Dialog open={detailsIdx >= 0} onClose={handleDetailsClose} maxWidth="sm" fullWidth disablePortal>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {detailsIdx >= 0 && (
            <Box>
              <Typography><b>Order ID:</b> {orders[detailsIdx].id}</Typography>
              <Typography><b>Customer:</b> {orders[detailsIdx].customer}</Typography>
              <Typography><b>Article:</b> {orders[detailsIdx].article}</Typography>
              <Typography><b>Sizes:</b> {orders[detailsIdx].sizes ? JSON.stringify(orders[detailsIdx].sizes) : ''}</Typography>
              <Typography><b>Total Quantity:</b> {orders[detailsIdx].totalQuantity}</Typography>
              <Typography><b>Status:</b> {orders[detailsIdx].status}</Typography>
              <Typography><b>Price:</b> {orders[detailsIdx].price}</Typography>
              <Typography><b>Notes:</b> {orders[detailsIdx].notes}</Typography>
              <Typography><b>Created At:</b> {orders[detailsIdx].createdAt ? new Date(orders[detailsIdx].createdAt).toLocaleString() : ''}</Typography>
              <Typography><b>Updated At:</b> {orders[detailsIdx].updatedAt ? new Date(orders[detailsIdx].updatedAt).toLocaleString() : ''}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* TNA Dialog for stage durations */}
      <Dialog open={tnaDialog.open} onClose={handleCloseTnaDialog} maxWidth="xs" fullWidth disablePortal>
        <DialogTitle>Specify Stage Durations (days)</DialogTitle>
        <DialogContent>
          {PRODUCTION_STAGES.map((stage, idx) => (
            <TextField
              key={stage}
              label={stage}
              type="number"
              value={stageDurations[idx]}
              onChange={e => handleDurationChange(idx, e.target.value)}
              fullWidth
              margin="dense"
              inputProps={{ min: 0 }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTnaDialog}>Cancel</Button>
          <Button onClick={handleSendToProductionWithTna} variant="contained" disabled={stageDurations.some(d => d === '')}>Send to Production</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}