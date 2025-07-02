import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({ orderNumber: '', customerName: '', status: '', date: '' });

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5123/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleOpen = (idx = -1) => {
    setEditIdx(idx);
    setForm(idx >= 0 ? orders[idx] : { orderNumber: '', customerName: '', status: '', date: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      if (editIdx >= 0) {
        await fetch(`http://localhost:5123/api/orders/${orders[editIdx].id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        });
      } else {
        await fetch('http://localhost:5123/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        });
      }
      setOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleDelete = async id => {
    try {
      await fetch(`http://localhost:5123/api/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Orders</Typography>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Order</Button>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell>{row.orderNumber}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(idx)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editIdx >= 0 ? 'Edit' : 'Add'} Order</DialogTitle>
        <DialogContent>
          <TextField label="Order Number" name="orderNumber" value={form.orderNumber} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Customer Name" name="customerName" value={form.customerName} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Status" name="status" value={form.status} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Date" name="date" value={form.date} onChange={handleChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 