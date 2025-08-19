import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper } from '@mui/material';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

// Function to get query parameters from URL
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default function Inspections() {
  const query = useQuery();
  const orderId = query.get('orderId');
  
  const [shipment, setShipment] = useState({
    shipmentId: '',
    orderId: '',
    material: '',
    quantity: 0,
    status: '',
  });
  const [productionTimeline, setProductionTimeline] = useState([]);
  const [rejected, setRejected] = useState('');
  const [ok, setOk] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photos, setPhotos] = useState([]);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imgPreview, setImgPreview] = useState(null);
  const [printDialog, setPrintDialog] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Fetch order details when orderId changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        // Fetch shipment details
        const shipmentRes = await fetch(`/api/shipments/byOrder/${orderId}`);
        const shipmentData = await shipmentRes.json();
        
        if (shipmentData) {
          setShipment({
            shipmentId: shipmentData.shipmentId || `SHP-${orderId}`,
            orderId: orderId,
            material: shipmentData.material || '',
            quantity: shipmentData.quantity || 0,
            status: shipmentData.status || 'Pending Inspection',
          });
        }
        
        // Fetch production timeline
        const timelineRes = await fetch(`/api/production/stages/${orderId}`);
        const timelineData = await timelineRes.json();
        
        if (timelineData && Array.isArray(timelineData)) {
          setProductionTimeline(timelineData);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setSnackbar({ open: true, message: 'Failed to load order details', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

  // Calculate score and pass/fail
  const total = Number(ok) + Number(rejected);
  const score = total > 0 ? Math.round((Number(ok) / total) * 100) : 0;
  const isBad = score < 80;
  
  // Calculate time to complete from production timeline
  const calculateTotalDays = () => {
    if (!productionTimeline || productionTimeline.length === 0) return 0;
    
    let totalDays = 0;
    productionTimeline.forEach(stage => {
      if (stage.actualDuration) {
        totalDays += Number(stage.actualDuration);
      } else if (stage.expectedDuration) {
        totalDays += Number(stage.expectedDuration);
      }
    });
    
    return totalDays;
  };
  
  const totalProductionDays = calculateTotalDays();
  const duration = startTime && endTime ? dayjs(endTime, 'HH:mm').diff(dayjs(startTime, 'HH:mm'), 'minute') : null;

  const handlePhotoChange = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleImgPreview = (file) => {
    const url = URL.createObjectURL(file);
    setImgPreview(url);
  };
  const handleImgPreviewClose = () => {
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    setImgPreview(null);
  };

  const handlePrint = () => {
    setPrintDialog(true);
  };
  const handlePrintConfirm = () => {
    setPrintDialog(false);
    setTimeout(() => window.print(), 200); // Print after dialog closes
  };

  const handleSubmit = async () => {
    try {
      // Create report data
      const reportData = {
        shipmentId: shipment.shipmentId,
        orderId: shipment.orderId,
        rejected: Number(rejected),
        ok: Number(ok),
        remarks,
        date,
        startTime,
        endTime,
        duration,
        score,
        pass: !isBad,
        totalProductionDays,
      };
      
      // Upload photos if any
      if (photos.length > 0) {
        const formData = new FormData();
        Array.from(photos).forEach((file, index) => {
          formData.append(`photo${index}`, file);
        });
        formData.append('reportData', JSON.stringify(reportData));
        
        // Send to API
        await fetch('/api/reports/inspection', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Send without photos
        await fetch('/api/reports/inspection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });
      }
      
      setSnackbar({ open: true, message: 'Inspection submitted and report added!', severity: 'success' });
    } catch (error) {
      console.error('Error submitting inspection:', error);
      setSnackbar({ open: true, message: 'Failed to submit inspection', severity: 'error' });
    }
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
      {isBad && (
        <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>
          RED ALERT: Inspection score is below 80%! Please review.
        </Alert>
      )}
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff', borderColor: '#e0e3e7', p: 2, display: 'flex', gap: 3, alignItems: 'center' }}>
        <Box>
          <Typography><b>Inspection Score:</b> {score}% ({score >= 80 ? 'Pass' : 'Fail'})</Typography>
          <Typography><b>Inspection Date:</b> {dayjs(date).format('dddd, DD/MM/YYYY')}</Typography>
          <Typography><b>Time to Complete:</b> {duration !== null ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '-'}</Typography>
          <Typography><b>Total Production Days:</b> {totalProductionDays} days</Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Button variant="outlined" onClick={handlePrint} sx={{ fontWeight: 600 }}>Print Report</Button>
        </Box>
      </Card>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Inspection Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          sx={{ flex: 1 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Start Time"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          sx={{ flex: 1 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Time"
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          sx={{ flex: 1 }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      {photos.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          {Array.from(photos).map((file, idx) => (
            <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, border: '1px solid #e0e3e7', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Inspection ${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={() => handleImgPreview(file)}
              />
              <Button size="small" sx={{ position: 'absolute', bottom: 2, left: 2, fontSize: 10, p: 0.5 }} onClick={() => {
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
              }}>Download</Button>
            </Box>
          ))}
        </Box>
      )}
      <Dialog open={!!imgPreview} onClose={handleImgPreviewClose} maxWidth="md">
        <DialogTitle>
          Image Preview
          <IconButton onClick={handleImgPreviewClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img src={imgPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 500 }} />
        </DialogContent>
      </Dialog>
      <Dialog open={printDialog} onClose={() => setPrintDialog(false)}>
        <DialogTitle>Include images in printout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => { setIncludeImages(false); handlePrintConfirm(); }}>No</Button>
          <Button variant="contained" onClick={() => { setIncludeImages(true); handlePrintConfirm(); }}>Yes</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Button variant="contained" sx={{ bgcolor: '#0080ff', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, float: 'right' }} onClick={handleSubmit}>
        Submit Inspection
      </Button>
    </Box>
  );
}