import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from '@mui/material';
import { apiPost, apiGet } from '../api';

export default function UploadOrder() {
  const [files, setFiles] = useState([]);
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState([]);

  const handleFileChange = async (e) => {
    setFiles([...e.target.files]);
    setExtracted(null);
    setError('');
    if (e.target.files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch('http://localhost:5124/api/orders/extract-python', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setExtracted(data.orders && data.orders.length > 0 ? data.orders[0] : null);
      setConfirmOpen(true);
    } catch (err) {
      setError('Extraction failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      // Map extracted data to order model
      const order = {
        Customer: extracted.clientName || extracted.Customer || '',
        Article: extracted.items && extracted.items[0] ? extracted.items[0].productName : '',
        Sizes: extracted.items ? Object.fromEntries(extracted.items.map(i => [i.size, parseInt(i.quantity)])) : {},
        TotalQuantity: extracted.items ? extracted.items.reduce((sum, i) => sum + parseInt(i.quantity), 0) : 0,
        Status: 'Pending Production',
        Price: 0,
        Notes: extracted.notes || '',
      };
      await apiPost('/api/orders/confirm-order', order);
      setSuccess(true);
      setConfirmOpen(false);
      fetchOrders(); // Refresh orders after upload
    } catch (err) {
      setError('Order confirmation failed: ' + err.message);
    } finally {
      setConfirming(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const data = await apiGet('/api/orders');
      setOrders(data);
    } catch (err) {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Upload Order Files
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f7f9fb', borderColor: '#e0e3e7', mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              border: '2px dashed #bfc8d9',
              borderRadius: 2,
              p: 5,
              textAlign: 'center',
              bgcolor: '#f7f9fb',
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Drag and drop files here
            </Typography>
            <Typography sx={{ color: '#888', mb: 2 }}>
              Or browse files from your computer
            </Typography>
            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              Browse Files
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>Order uploaded and confirmed successfully!</Alert>}
          </Box>
        </CardContent>
      </Card>
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="md" fullWidth disablePortal>
        <DialogTitle>Confirm Order Details</DialogTitle>
        <DialogContent>
          {extracted ? (
            <>
              <Typography sx={{ mb: 2 }}><b>Customer:</b> {extracted.clientName || extracted.Customer}</Typography>
              <Typography sx={{ mb: 2 }}><b>Delivery Date:</b> {extracted.deliveryDate}</Typography>
              <Typography sx={{ mb: 2 }}><b>Notes:</b> {extracted.notes}</Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f7fa' }}>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Fabric Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extracted.items && extracted.items.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.productName}</TableCell>
                        <TableCell>{row.size}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{row.color}</TableCell>
                        <TableCell>{row.fabricType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : <Typography>No extracted data found.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" disabled={confirming} sx={{ bgcolor: '#0080ff', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2 }}>
            {confirming ? <CircularProgress size={24} /> : 'Confirm & Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Orders Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25', mt: 6 }}>
        All Orders
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Article</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Quantity</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((row, idx) => (
              <TableRow key={row.id || idx}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.article}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.totalQuantity}</TableCell>
                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}