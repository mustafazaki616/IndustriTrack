import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, MenuItem, Select } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import dayjs from 'dayjs';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';

const stockBreakdown = [
  { product: 'Product A', xs: 100, s: 200, m: 300, l: 250, xl: 150, total: 1000 },
  { product: 'Product B', xs: 50, s: 100, m: 150, l: 125, xl: 75, total: 500 },
  { product: 'Product C', xs: 75, s: 150, m: 225, l: 188, xl: 113, total: 750 },
  { product: 'Product D', xs: 125, s: 250, m: 375, l: 313, xl: 188, total: 1250 },
  { product: 'Product E', xs: 25, s: 50, m: 75, l: 63, xl: 38, total: 250 },
];

const stockLogs = [
  { date: '2024-03-08', product: 'Product A', type: 'In', quantity: 100, reason: 'New Stock' },
  { date: '2024-03-07', product: 'Product B', type: 'Out', quantity: 50, reason: 'Order #1234' },
  { date: '2024-03-06', product: 'Product C', type: 'In', quantity: 75, reason: 'Restock' },
  { date: '2024-03-05', product: 'Product D', type: 'Out', quantity: 125, reason: 'Order #5678' },
  { date: '2024-03-04', product: 'Product E', type: 'In', quantity: 25, reason: 'New Stock' },
];

const lowStockAlerts = [
  { product: 'Product B', size: 'XS', current: 50, threshold: 100 },
  { product: 'Product E', size: 'All', current: 250, threshold: 300 },
  { product: 'Product C', size: 'XL', current: 113, threshold: 150 },
];

const initialPrices = { 'Product A': 10, 'Product B': 12, 'Product C': 8, 'Product D': 15, 'Product E': 7 };
const initialStatus = (row) => row.total < 100 ? 'Low Stock' : 'In Stock';
const statusColor = (status) => status === 'Low Stock' ? 'warning' : status === 'Out of Stock' ? 'error' : 'success';

export default function Inventory() {
  const [materialFilters, setMaterialFilters] = useState(['Leather', 'Textile', 'Synthetic', 'Other']);
  const [prices, setPrices] = useState(initialPrices);
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [editProduct, setEditProduct] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [stockOutProduct, setStockOutProduct] = useState('');
  const [stockOutQty, setStockOutQty] = useState('');
  const [stockOutBuyer, setStockOutBuyer] = useState('');
  const [stockOutDate, setStockOutDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [stockOutReason, setStockOutReason] = useState('Sale');
  const [stockOutLog, setStockOutLog] = useState([]);
  const [loadingStockOut, setLoadingStockOut] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const fetchStockOuts = async () => {
      setLoadingStockOut(true);
      try {
        const res = await axios.get('/api/stockout');
        setStockOutLog(res.data);
      } catch {
        setSnackbar({ open: true, message: 'Failed to fetch stock out log', severity: 'error' });
      } finally {
        setLoadingStockOut(false);
      }
    };
    fetchStockOuts();
  }, []);

  // Edit price handlers
  const handleEditPriceOpen = (product) => {
    setEditProduct(product);
    setEditPrice(prices[product] || '');
    setEditPriceOpen(true);
  };
  const handleEditPriceSave = () => {
    setPrices((prev) => ({ ...prev, [editProduct]: Number(editPrice) }));
    setEditPriceOpen(false);
    setSnackbar({ open: true, message: 'Price updated!', severity: 'success' });
  };

  // Stock out handlers
  const handleStockOutOpen = (product) => {
    setStockOutProduct(product);
    setStockOutQty('');
    setStockOutBuyer('');
    setStockOutDate(dayjs().format('YYYY-MM-DD'));
    setStockOutReason('Sale');
    setStockOutOpen(true);
  };
  const handleStockOutConfirm = async () => {
    const entry = {
      product: stockOutProduct,
      quantity: Number(stockOutQty),
      buyer: stockOutBuyer,
      date: stockOutDate,
      reason: stockOutReason,
      price: prices[stockOutProduct],
      total: Number(stockOutQty) * (prices[stockOutProduct] || 0),
    };
    try {
      await axios.post('/api/stockout', entry);
      setSnackbar({ open: true, message: 'Stock out recorded!', severity: 'success' });
      // Refresh log
      const res = await axios.get('/api/stockout');
      setStockOutLog(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to record stock out', severity: 'error' });
    }
    setStockOutOpen(false);
  };
  const handleGenerateInvoice = () => {
    setSnackbar({ open: true, message: 'Invoice generated (demo)!', severity: 'success' });
  };

  const handleDetailsOpen = (product) => {
    setDetailsProduct(product);
    setDetailsOpen(true);
  };
  const handleDetailsClose = () => setDetailsOpen(false);
  const handleInvoiceOpen = (data) => {
    setInvoiceData(data);
    setInvoiceOpen(true);
  };
  const handleInvoiceClose = () => setInvoiceOpen(false);
  const handlePrintInvoice = () => {
    setTimeout(() => window.print(), 200);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Stock Overview
      </Typography>
      <Typography sx={{ color: '#555', mb: 2 }}>
        View and manage your current stock levels, including size-wise breakdowns and material-specific filters.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {['All Materials', 'Leather', 'Textile', 'Synthetic', 'Other'].map((mat) => (
          <Button key={mat} variant="outlined" sx={{ bgcolor: '#f5f7fa', color: '#222', border: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#e3e7ed' } }}>{mat}</Button>
        ))}
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>XS</TableCell>
              <TableCell>S</TableCell>
              <TableCell>M</TableCell>
              <TableCell>L</TableCell>
              <TableCell>XL</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockBreakdown.map((row, idx) => {
              const status = initialStatus(row);
              return (
                <TableRow key={idx}>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.xs}</TableCell>
                  <TableCell>{row.s}</TableCell>
                  <TableCell>{row.m}</TableCell>
                  <TableCell>{row.l}</TableCell>
                  <TableCell>{row.xl}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>
                    ${prices[row.product] || '-'}
                    <Button size="small" variant="text" sx={{ ml: 1, fontSize: 12 }} onClick={() => handleEditPriceOpen(row.product)}>Edit</Button>
                  </TableCell>
                  <TableCell>
                    <Chip label={status} color={statusColor(status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleStockOutOpen(row.product)}>Stock Out</Button>
                    <Button size="small" variant="text" sx={{ ml: 1 }} onClick={() => handleDetailsOpen(row.product)}>Details</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Stock In/Out Logs
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockLogs.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Low Stock Alerts
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Current Stock</TableCell>
              <TableCell>Threshold</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lowStockAlerts.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.size}</TableCell>
                <TableCell>{row.current}</TableCell>
                <TableCell>{row.threshold}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={editPriceOpen} onClose={() => setEditPriceOpen(false)}>
        <DialogTitle>Edit Price</DialogTitle>
        <DialogContent>
          <TextField label="Price" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPriceOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditPriceSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={stockOutOpen} onClose={() => setStockOutOpen(false)}>
        <DialogTitle>Stock Out</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Quantity" type="number" value={stockOutQty} onChange={e => setStockOutQty(e.target.value)} fullWidth />
          <TextField label="Buyer/Customer" value={stockOutBuyer} onChange={e => setStockOutBuyer(e.target.value)} fullWidth />
          <TextField label="Date" type="date" value={stockOutDate} onChange={e => setStockOutDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Reason" value={stockOutReason} onChange={e => setStockOutReason(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockOutOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStockOutConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
      {/* Stock Out Log Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Stock Out Transactions
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingStockOut ? (
              <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
            ) : stockOutLog.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">No stock out transactions yet.</TableCell></TableRow>
            ) : (
              stockOutLog.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{entry.product}</TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell>{entry.buyer}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell>${entry.price}</TableCell>
                  <TableCell>${entry.total}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleInvoiceOpen(entry)}>Generate Invoice</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="sm" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent dividers>
          {detailsProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{detailsProduct}</Typography>
              {(() => {
                const prod = stockBreakdown.find(p => p.product === detailsProduct);
                if (!prod) return null;
                return (
                  <>
                    <Typography><b>XS:</b> {prod.xs}</Typography>
                    <Typography><b>S:</b> {prod.s}</Typography>
                    <Typography><b>M:</b> {prod.m}</Typography>
                    <Typography><b>L:</b> {prod.l}</Typography>
                    <Typography><b>XL:</b> {prod.xl}</Typography>
                    <Typography><b>Total:</b> {prod.total}</Typography>
                    <Typography><b>Price:</b> ${prices[prod.product]}</Typography>
                    <Typography><b>Status:</b> {initialStatus(prod)}</Typography>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Recent Stock Logs:</Typography>
                    {stockLogs.filter(l => l.product === prod.product).length === 0 ? (
                      <Typography>No logs for this product.</Typography>
                    ) : (
                      stockLogs.filter(l => l.product === prod.product).map((log, idx) => (
                        <Typography key={idx} sx={{ fontSize: 14 }}>
                          {log.date} - {log.type} {log.quantity} ({log.reason})
                        </Typography>
                      ))
                    )}
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={invoiceOpen} onClose={handleInvoiceClose} maxWidth="sm" fullWidth>
        <DialogTitle>Invoice</DialogTitle>
        <DialogContent dividers>
          {invoiceData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Invoice for {invoiceData.product}</Typography>
              <Typography><b>Date:</b> {invoiceData.date}</Typography>
              <Typography><b>Buyer:</b> {invoiceData.buyer}</Typography>
              <Typography><b>Quantity:</b> {invoiceData.qty}</Typography>
              <Typography><b>Unit Price:</b> ${invoiceData.price}</Typography>
              <Typography><b>Total:</b> ${invoiceData.total}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<PrintIcon />} onClick={handlePrintInvoice}>Print</Button>
          <Button onClick={handleInvoiceClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
} 