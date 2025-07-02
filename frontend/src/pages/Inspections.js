import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper } from '@mui/material';

const shipment = {
  shipmentId: 'SHP-2023-0012',
  orderId: 'ORD-2023-0045',
  material: 'Leather',
  quantity: 500,
  status: 'In Transit',
};

export default function Inspections() {
  const [rejected, setRejected] = useState('');
  const [ok, setOk] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photos, setPhotos] = useState([]);

  const handlePhotoChange = (e) => {
    setPhotos([...e.target.files]);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Shipment Inspection
      </Typography>
      <Typography sx={{ color: '#555', mb: 2 }}>
        Inspection details for shipment <b>#{shipment.shipmentId}</b>
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Shipment ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{shipment.shipmentId}</TableCell>
              <TableCell>{shipment.orderId}</TableCell>
              <TableCell>{shipment.material}</TableCell>
              <TableCell>{shipment.quantity}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" sx={{ bgcolor: '#f5f7fa', color: '#222', border: 'none', fontWeight: 600, borderRadius: 2 }}>{shipment.status}</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Inspection Results
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        <TextField
          label="Rejected Pieces"
          placeholder="Enter number of rejected pieces"
          value={rejected}
          onChange={e => setRejected(e.target.value)}
          sx={{ flex: 1, mb: 2 }}
        />
        <TextField
          label="OK Pieces"
          placeholder="Enter number of OK pieces"
          value={ok}
          onChange={e => setOk(e.target.value)}
          sx={{ flex: 1, mb: 2 }}
        />
      </Box>
      <TextField
        label="Remarks"
        placeholder="Enter remarks"
        value={remarks}
        onChange={e => setRemarks(e.target.value)}
        fullWidth
        multiline
        minRows={3}
        sx={{ mb: 3 }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Photos (Optional)
      </Typography>
      <Card variant="outlined" sx={{ border: '2px dashed #bfc8d9', borderRadius: 2, bgcolor: '#f7f9fb', mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            Upload Photos
          </Typography>
          <Typography sx={{ color: '#888', mb: 2 }}>
            Drag and drop or click to upload photos of the shipment inspection.
          </Typography>
          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Upload Photos
            <input type="file" hidden multiple onChange={handlePhotoChange} />
          </Button>
        </CardContent>
      </Card>
      <Button variant="contained" sx={{ bgcolor: '#0080ff', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, float: 'right' }}>
        Submit Inspection
      </Button>
    </Box>
  );
} 