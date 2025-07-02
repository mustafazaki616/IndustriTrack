import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, MenuItem, Select } from '@mui/material';

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

export default function Inventory() {
  const [materialFilters, setMaterialFilters] = useState(['Leather', 'Textile', 'Synthetic', 'Other']);

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
            </TableRow>
          </TableHead>
          <TableBody>
            {stockBreakdown.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.xs}</TableCell>
                <TableCell>{row.s}</TableCell>
                <TableCell>{row.m}</TableCell>
                <TableCell>{row.l}</TableCell>
                <TableCell>{row.xl}</TableCell>
                <TableCell>{row.total}</TableCell>
              </TableRow>
            ))}
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
    </Box>
  );
} 