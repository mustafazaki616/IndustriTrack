import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Checkbox, FormControlLabel, Alert
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { DashboardAlertContext } from '../contexts/DashboardAlertContext';
import axios from 'axios';
import dayjs from 'dayjs';

const currencies = ['USD', 'EUR', 'JPY', 'RMB', 'CAD', 'GBP'];

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

const todayISO = () => dayjs().format('YYYY-MM-DD');

export default function Payments() {
  const [filter, setFilter] = useState('All');
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [daysLeftInput, setDaysLeftInput] = useState('');
  const [showDaysLeftInput, setShowDaysLeftInput] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addPayment, setAddPayment] = useState({
    orderId: '',
    customerName: '',
    amount: '',
    status: 'Pending',
    currency: 'USD',
    advanceReceived: false,
    advanceDueDaysLeft: 5,
    daysUntilFullPayment: 10,
    remainingAmount: '',
  });
  const [addDaysLeftInput, setAddDaysLeftInput] = useState('');
  const [addShowDaysLeftInput, setAddShowDaysLeftInput] = useState(false);
  const [addError, setAddError] = useState('');
  const { addDashboardAlert } = useContext(DashboardAlertContext);

  // Fetch payments from backend
  useEffect(() => {
    axios.get('/api/payments').then(res => {
      setPaymentData(res.data);
      console.log('Fetched payments:', res.data);
    });
  }, []);

  // Reverse counter effect and dashboard alert
  useEffect(() => {
    paymentData.forEach((row) => {
      if (
        row.advanceReceived &&
        row.DaysLeftForCompletePayment &&
        row.Status !== 'Paid' &&
        row.FullPaymentStartDate
      ) {
        const daysPassed = daysBetween(row.FullPaymentStartDate, new Date());
        const daysLeft = Number(row.DaysLeftForCompletePayment) - daysPassed;
        if (daysLeft <= 0) {
          addDashboardAlert(
            `${row.Customer} hasn't paid their full amount yet.`,
            row.Id
          );
        }
      }
    });
    // eslint-disable-next-line
  }, [paymentData]);

  const handleLedgerOpen = (customer) => {
    setSelectedVendor(customer);
    setLedgerOpen(true);
  };
  const handleLedgerClose = () => setLedgerOpen(false);

  const handleEditOpen = (payment) => {
    setEditPayment({ ...payment });
    setDaysLeftInput(payment.DaysLeftForCompletePayment || '');
    setShowDaysLeftInput(payment.AdvanceReceived);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setShowDaysLeftInput(false);
    setDaysLeftInput('');
  };

  const handleInvoice = (payment) => {
    alert(`Invoice generated for ${payment.OrderId}`);
  };

  const handleAdvanceChange = (e) => {
    const checked = e.target.checked;
    setEditPayment((prev) => ({ ...prev, AdvanceReceived: checked }));
    setShowDaysLeftInput(checked);
    if (!checked) setDaysLeftInput('');
  };

  const handleDaysLeftInput = (e) => {
    setDaysLeftInput(e.target.value);
  };

  const handleSave = async () => {
    const updated = {
      id: editPayment.id,
      orderId: Number(editPayment.orderId),
      customerName: editPayment.customerName,
      amount: Number(editPayment.amount),
      status: editPayment.status,
      currency: editPayment.currency,
      advanceReceived: editPayment.advanceReceived,
      advanceDueDaysLeft: Number(editPayment.advanceDueDaysLeft),
      daysUntilFullPayment: editPayment.advanceReceived ? Number(editPayment.daysUntilFullPayment) : 0,
      remainingAmount: editPayment.remainingAmount ? Number(editPayment.remainingAmount) : 0,
    };
    await axios.put(`/api/payments/${editPayment.id}`, updated);
    const res = await axios.get('/api/payments');
    setPaymentData(res.data);
    handleEditClose();
  };

  // Add Payment Handlers
  const handleAddOpen = () => {
    setAddOpen(true);
    setAddPayment({
      orderId: '',
      customerName: '',
      amount: '',
      status: 'Pending',
      currency: 'USD',
      advanceReceived: false,
      advanceDueDaysLeft: 5,
      daysUntilFullPayment: 10,
      remainingAmount: '',
    });
    setAddShowDaysLeftInput(false);
    setAddError('');
  };
  const handleAddClose = () => {
    setAddOpen(false);
    setAddShowDaysLeftInput(false);
    setAddDaysLeftInput('');
    setAddError('');
  };
  const handleAddAdvanceChange = (e) => {
    const checked = e.target.checked;
    setAddPayment((prev) => ({ ...prev, AdvanceReceived: checked }));
    setAddShowDaysLeftInput(checked);
    if (!checked) setAddDaysLeftInput('');
  };
  const handleAddDaysLeftInput = (e) => {
    setAddDaysLeftInput(e.target.value);
  };
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddPayment((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddSave = async () => {
    setAddError('');
    if (!addPayment.orderId || isNaN(Number(addPayment.orderId))) {
      setAddError('Order ID is required and must be a number.');
      return;
    }
    if (!addPayment.customerName) {
      setAddError('Customer Name is required.');
      return;
    }
    if (!addPayment.amount || isNaN(Number(addPayment.amount))) {
      setAddError('Amount is required and must be a number.');
      return;
    }
    if (!addPayment.status) {
      setAddError('Status is required.');
      return;
    }
    if (addPayment.advanceDueDaysLeft === '' || isNaN(Number(addPayment.advanceDueDaysLeft)) || Number(addPayment.advanceDueDaysLeft) <= 0) {
      setAddError('Advance Due (days left) is required and must be a positive number.');
      return;
    }
    if (addPayment.advanceReceived && (addPayment.daysUntilFullPayment === '' || isNaN(Number(addPayment.daysUntilFullPayment)) || Number(addPayment.daysUntilFullPayment) <= 0)) {
      setAddError('Days Until Full Payment is required and must be a positive number.');
      return;
    }
    const toSend = {
      orderId: Number(addPayment.orderId),
      customerName: addPayment.customerName,
      amount: Number(addPayment.amount),
      status: addPayment.status,
      currency: addPayment.currency,
      advanceReceived: addPayment.advanceReceived,
      advanceDueDaysLeft: Number(addPayment.advanceDueDaysLeft),
      daysUntilFullPayment: addPayment.advanceReceived ? Number(addPayment.daysUntilFullPayment) : 0,
      remainingAmount: addPayment.remainingAmount ? Number(addPayment.remainingAmount) : 0,
    };
    try {
      await axios.post('/api/payments', toSend);
      const refreshed = await axios.get('/api/payments');
      setPaymentData(refreshed.data);
      handleAddClose();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add payment.');
    }
  };

  // Add Delete logic
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      await axios.delete(`/api/payments/${id}`);
      const refreshed = await axios.get('/api/payments');
      setPaymentData(refreshed.data);
    } catch (err) {
      alert('Failed to delete payment.');
    }
  };

  const filteredPayments = paymentData.filter(row => filter === 'All' || row.status === filter);

  useEffect(() => {
    paymentData.forEach((row) => {
      if (
        row.advanceReceived &&
        row.daysUntilFullPayment === 0 &&
        row.status !== 'Completed'
      ) {
        addDashboardAlert(
          `Payment for ${row.customerName} is due or not paid still!`,
          `due-${row.id}`
        );
      }
    });
    // eslint-disable-next-line
  }, [paymentData]);

  // Red warning banner for overdue payments
  const overduePayments = paymentData.filter(p => p.advanceDueDaysLeft !== undefined && p.advanceDueDaysLeft < 0 && p.status === 'Unpaid');

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {overduePayments.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {overduePayments.map(p => (
            <div key={p.orderId}>
              ⚠ Payment overdue: {p.customerName} ({p.amount} USD) — Advance not received on time.
            </div>
          ))}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#181c25' }}>
          Payments
        </Typography>
        <Button variant="contained" sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 600, borderRadius: 2 }} onClick={handleAddOpen}>
          Add Payment
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {['All', 'Paid', 'Partial', 'Unpaid'].map((s) => (
          <Button key={s} variant={filter === s ? 'contained' : 'outlined'} onClick={() => setFilter(s)} sx={{ fontWeight: 600 }}>{s}</Button>
        ))}
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Advance Received</TableCell>
              <TableCell>Advance Due (days left)</TableCell>
              <TableCell>Remaining</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Days Until Full Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((row, idx) => {
              let daysLeft = '-';
              if (row.advanceReceived && row.daysLeftForCompletePayment && row.fullPaymentStartDate) {
                const daysPassed = daysBetween(row.fullPaymentStartDate, new Date());
                daysLeft = Math.max(Number(row.daysLeftForCompletePayment) - daysPassed, 0);
              } else if (row.status !== 'Paid' && row.shippedDate) {
                daysLeft = daysBetween(row.shippedDate, new Date());
              }
              return (
                <TableRow key={idx}>
                  <TableCell>{row.orderId}</TableCell>
                  <TableCell>
                    {row.customerName}
                    <Button size="small" variant="text" sx={{ ml: 1, fontSize: 12 }} onClick={() => handleLedgerOpen(row.customerName)}>
                      View Ledger
                    </Button>
                  </TableCell>
                  <TableCell>{row.amount?.toLocaleString()} {row.currency}</TableCell>
                  <TableCell>{row.currency}</TableCell>
                  <TableCell>
                    <Checkbox checked={row.advanceReceived} sx={{ color: blue[600], '&.Mui-checked': { color: blue[600] } }} disabled />
                  </TableCell>
                  <TableCell>
                    {typeof row.advanceDueDaysLeft === 'number' ? (
                      <span style={{ color: row.advanceDueDaysLeft < 0 ? 'red' : undefined }}>
                        {row.advanceDueDaysLeft}
                      </span>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{row.remainingAmount?.toLocaleString()} {row.currency}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={row.status === 'Completed' ? 'success' : row.status === 'Partial' ? 'warning' : row.status === 'Unpaid' ? 'error' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {typeof row.daysUntilFullPayment === 'number' ? (
                      <span style={{ color: row.daysUntilFullPayment < 0 ? 'red' : undefined }}>
                        {row.daysUntilFullPayment}
                      </span>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleInvoice(row)}>
                      Generate Invoice
                    </Button>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEditOpen(row)}>
                      Update
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(row.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Ledger Dialog */}
      <Dialog open={ledgerOpen} onClose={handleLedgerClose} maxWidth="md" fullWidth>
        <DialogTitle>Vendor Ledger - {selectedVendor}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>All payment history for this vendor will be shown here.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLedgerClose}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Payment Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Payment</DialogTitle>
        <DialogContent>
          {editPayment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Order ID" value={editPayment.orderId} disabled fullWidth />
              <TextField label="Customer Name" value={editPayment.customerName} disabled fullWidth />
              <TextField label="Amount" value={editPayment.amount} onChange={e => setEditPayment(prev => ({ ...prev, amount: e.target.value }))} fullWidth />
              <Select label="Currency" value={editPayment.currency} fullWidth>
                {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
              <FormControlLabel
                control={<Checkbox checked={editPayment.advanceReceived} onChange={handleAdvanceChange} sx={{ color: blue[600], '&.Mui-checked': { color: blue[600] } }} />}
                label="Advance Received"
              />
              {editPayment.advanceReceived && (
                <TextField label="Days Until Full Payment" value={editPayment.daysUntilFullPayment} onChange={e => setEditPayment(prev => ({ ...prev, daysUntilFullPayment: e.target.value }))} fullWidth />
              )}
              <TextField label="Advance Due (days left)" value={editPayment.advanceDueDaysLeft} onChange={e => setEditPayment(prev => ({ ...prev, advanceDueDaysLeft: e.target.value }))} fullWidth />
              <TextField label="Remaining Amount" value={editPayment.remainingAmount} onChange={e => setEditPayment(prev => ({ ...prev, remainingAmount: e.target.value }))} fullWidth />
              <Select label="Status" value={editPayment.status} onChange={e => setEditPayment(prev => ({ ...prev, status: e.target.value }))} fullWidth>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      {/* Add Payment Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Order ID" name="orderId" value={addPayment.orderId} onChange={handleAddChange} fullWidth required type="number" />
            <TextField label="Customer Name" name="customerName" value={addPayment.customerName} onChange={handleAddChange} fullWidth required />
            <TextField label="Amount" name="amount" value={addPayment.amount} onChange={handleAddChange} fullWidth required type="number" />
            <Select label="Currency" name="currency" value={addPayment.currency} onChange={handleAddChange} fullWidth>
              {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            <FormControlLabel
              control={<Checkbox checked={addPayment.advanceReceived} onChange={handleAddAdvanceChange} sx={{ color: blue[600], '&.Mui-checked': { color: blue[600] } }} />}
              label="Advance Received"
            />
            {addPayment.advanceReceived && (
              <TextField
                label="Days Until Full Payment"
                name="daysUntilFullPayment"
                value={addPayment.daysUntilFullPayment}
                onChange={handleAddChange}
                fullWidth
                type="number"
                required
              />
            )}
            <TextField label="Advance Due (days)" name="advanceDueDaysLeft" value={addPayment.advanceDueDaysLeft} onChange={handleAddChange} fullWidth required type="number" />
            <TextField label="Remaining Amount" name="remainingAmount" value={addPayment.remainingAmount} onChange={handleAddChange} fullWidth type="number" />
            <Select label="Status" name="status" value={addPayment.status} onChange={handleAddChange} fullWidth>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Partial">Partial</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 