import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';
import { apiPost, apiGet } from '../api';
import { Snackbar, Alert } from '@mui/material';
import { useState as useReactState } from 'react';

export default function Production() {
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [stagesMap, setStagesMap] = useState({}); // { orderId: [stages] }
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [starting, setStarting] = useState(null);
  const [forwarding, setForwarding] = useReactState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generatingReportId, setGeneratingReportId] = useState(null);
  const [stagePrompt, setStagePrompt] = useState({ open: false, stage: null, orderId: null });
  const [extendDays, setExtendDays] = useState(1);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const data = await apiGet('/api/production');
        setProductions(data);
        // Fetch stages for each production
        const map = {};
        for (const prod of data) {
          try {
            const stages = await apiGet(`/api/production/stages/${prod.orderId}`);
            map[prod.orderId] = stages;
          } catch (e) {
            map[prod.orderId] = [];
          }
        }
        setStagesMap(map);
      } catch (err) {
        setProductions([]);
        setStagesMap({});
      } finally {
        setLoading(false);
      }
    };
    fetchProductions();
  }, []);

  const handleStagePrompt = (stage, orderId) => {
    setStagePrompt({ open: true, stage, orderId });
    setExtendDays(1);
  };
  const handleCloseStagePrompt = () => setStagePrompt({ open: false, stage: null, orderId: null });

  const handleCompleteStage = async () => {
    const { stage } = stagePrompt;
    await apiPost('/api/orders/production/updateStage', {
      StageId: stage.id,
      Status: 'Completed',
      CompletionDate: new Date().toISOString(),
      ActualDuration: dayjs().diff(dayjs(stage.startDate), 'day')
    });
    await refreshProductions();
    setSnackbar({ open: true, message: 'Stage marked as completed', severity: 'success' });
    handleCloseStagePrompt();
  };
  const handleExtendStage = async () => {
    const { stage } = stagePrompt;
    await apiPost('/api/orders/production/updateStage', {
      StageId: stage.id,
      Status: 'In Progress',
      ExpectedDuration: stage.expectedDuration + Number(extendDays)
    });
    await refreshProductions();
    setSnackbar({ open: true, message: 'Stage duration extended', severity: 'success' });
    handleCloseStagePrompt();
  };
  const refreshProductions = async () => {
    const data = await apiGet('/api/production');
    setProductions(data);
    const map = {};
    for (const prod of data) {
      const stages = await apiGet(`/api/production/stages/${prod.orderId}`);
      map[prod.orderId] = stages;
    }
    setStagesMap(map);
  };

  const filtered = productions.filter(
    (p) =>
      p.product?.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'product', headerName: 'Product', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
  ];

  const stageSteps = [
    'TRIMS IN HOUSE',
    'FABRIC ETA',
    'CUTTING',
    'STITCHING',
    'FINISHING',
    'PACKING',
    'OFFLINE',
    'INSPECTION'
  ];

  const handleViewOrder = async (orderId) => {
    try {
      // Navigate to the orders page with the specific order ID
      navigate(`/orders?id=${orderId}`);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to navigate to order details', severity: 'error' });
    }
  };

  const handleOrderModalClose = () => setOrderModalOpen(false);

  const handleStartInspection = async (orderId) => {
    setStarting(orderId);
    try {
      await apiPost(`/api/inspections/start/${orderId}`);
      // Refresh productions
      const data = await apiGet('/api/production');
      setProductions(data);
      // Navigate to the inspections page
      navigate(`/inspections?orderId=${orderId}`);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to start inspection: ' + err.message, severity: 'error' });
    } finally {
      setStarting(null);
    }
  };

  const handleForwardToShipment = async (orderId) => {
    setForwarding(orderId);
    try {
      await apiPost(`/api/shipments/approve/${orderId}`);
      setSnackbar({ open: true, message: 'Shipment approved', severity: 'success' });
      const data = await apiGet('/api/production');
      setProductions(data);
      // Navigate to the shipments page
      navigate(`/shipments?orderId=${orderId}`);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to approve shipment', severity: 'error' });
    } finally {
      setForwarding(null);
    }
  };

  const handleGenerateReport = async (productionId) => {
    setGeneratingReportId(productionId);
    try {
      await apiPost(`/api/reports/generate/${productionId}`);
      setSnackbar({ open: true, message: 'Report generated successfully', severity: 'success' });
      // Refresh productions
      const data = await apiGet('/api/production');
      setProductions(data);
      // Navigate to the reports page
      navigate(`/reports?productionId=${productionId}`);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to generate report', severity: 'error' });
    } finally {
      setGeneratingReportId(null);
    }
  };

  // Calculate summary counts
  const overdueCount = Object.values(stagesMap).flat().filter(s => s.status === 'Overdue').length;
  const dueSoonCount = filtered.filter(prod => prod.expectedDuration && prod.actualDuration && Number(prod.expectedDuration) - Number(prod.actualDuration) <= 1 && Number(prod.expectedDuration) - Number(prod.actualDuration) <= 0).length;

  // Normalization function for stage comparison
  const normalize = s => s?.trim().toUpperCase().replace('.', '');

  // Custom Step Icon for highlighting current stage in green
  function CustomStepIcon(props) {
    const { active, completed, icon } = props;
    console.log('CustomStepIcon props:', props); // Debug: see what props are passed
    if (completed) {
      return (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: '#e0e3e7',
            color: '#388e3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            border: '2px solid #e0e3e7',
          }}
        >
          <CheckCircleIcon sx={{ color: '#388e3c', fontSize: 22 }} />
        </Box>
      );
    }
    return (
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: active ? '#388e3c' : '#e0e3e7',
          color: active ? '#fff' : '#222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 16,
          border: active ? '2px solid #388e3c' : '2px solid #e0e3e7',
          transition: 'all 0.2s',
        }}
      >
        {icon}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#181c25' }}>
        Production (Time & Action)
      </Typography>
      {/* Summary bar for overdue/due soon */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
          {overdueCount > 0 && <Chip label={`${overdueCount} stage${overdueCount > 1 ? 's' : ''} overdue`} color="error" sx={{ fontWeight: 600 }} />}
          {dueSoonCount > 0 && <Chip label={`${dueSoonCount} order${dueSoonCount > 1 ? 's' : ''} due soon`} color="warning" sx={{ fontWeight: 600 }} />}
        </Box>
      )}
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff', borderColor: '#e0e3e7' }}>
        <CardContent>
          <TextField
            label="Search by product or status"
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {productions.map((prod) => {
          const stages = stagesMap[prod.orderId] || [];
          const hasStages = stages.length > 0;
          const currentStageIdx = hasStages ? stages.findIndex(s => s.status === 'In Progress' || s.status === 'Overdue') : 0;
          return (
            <Card key={prod.id} variant="outlined" sx={{ borderRadius: 2, bgcolor: '#fff', borderColor: '#e0e3e7', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Order #{prod.orderId}{prod.Customer || prod.customer ? ` - ${prod.Customer || prod.customer}` : ''}</Typography>
                <Box>
                  <Chip label={prod.status} color={prod.status === 'Completed' ? 'success' : prod.status === 'In Progress' ? 'warning' : prod.status === 'Inspection' ? 'info' : undefined} sx={{ fontWeight: 600, mr: 1 }} />
                </Box>
              </Box>
              {hasStages ? (
                <>
                  <Stepper activeStep={currentStageIdx} alternativeLabel sx={{ mb: 2 }}>
                    {stages.map((stage, idx) => (
                      <Step key={stage.id} completed={stage.status === 'Completed'}>
                        <StepLabel StepIconComponent={CustomStepIcon}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span>{stage.stageName}</span>
                            <Typography variant="caption" color="text.secondary">{stage.expectedDuration} days</Typography>
                            <Chip label={stage.status} size="small" color={stage.status === 'Completed' ? 'success' : stage.status === 'In Progress' ? 'warning' : stage.status === 'Overdue' ? 'error' : 'default'} sx={{ mt: 0.5 }} />
                          </Box>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {stages.map((stage, idx) => (
                      <Box key={stage.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography><b>{stage.stageName}</b></Typography>
                        <Typography>Expected: {stage.expectedDuration}d</Typography>
                        <Typography>Start: {stage.startDate ? dayjs(stage.startDate).format('DD/MM/YYYY') : '-'}</Typography>
                        <Typography>Done: {stage.completionDate ? dayjs(stage.completionDate).format('DD/MM/YYYY') : '-'}</Typography>
                        <Typography>Notes: {stage.notes || '-'}</Typography>
                        {stage.status === 'Overdue' && (
                          <Button size="small" color="error" variant="outlined" onClick={() => handleStagePrompt(stage, prod.orderId)}>Resolve</Button>
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography color="error" sx={{ mb: 2 }}>No production stages found for this order.</Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" sx={{ fontWeight: 600 }} onClick={() => handleViewOrder(prod.orderId || prod.id)}>View Order</Button>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {/* Show Start Inspection button only if all 8 stages are completed */}
                  {stages.length === 8 && stages.every(s => s.status === 'Completed') && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#0080ff', color: '#fff', fontWeight: 700, borderRadius: 2 }}
                      onClick={() => handleStartInspection(prod.orderId || prod.id)}
                      disabled={starting === (prod.orderId || prod.id)}
                    >
                      {starting === (prod.orderId || prod.id) ? 'Starting...' : 'Start Inspection'}
                    </Button>
                  )}
                  {/* Forward to Shipment button logic */}
                  {stages.length > 0 && stages[stages.length - 1].status === 'Completed' && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#388e3c', color: '#fff', fontWeight: 700, borderRadius: 2 }}
                      onClick={() => handleForwardToShipment(prod.orderId || prod.id)}
                      disabled={forwarding === (prod.orderId || prod.id)}
                    >
                      {forwarding === (prod.orderId || prod.id) ? 'Forwarding...' : 'Forward to Shipment'}
                    </Button>
                  )}
                  {/* Generate Report button logic */}
                  {stages.length > 0 && stages[stages.length - 1].status === 'Completed' && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#6c63ff', color: '#fff', fontWeight: 700, borderRadius: 2 }}
                      onClick={() => handleGenerateReport(prod.id)}
                      disabled={generatingReportId === prod.id}
                    >
                      {generatingReportId === prod.id ? 'Generating...' : 'Generate Report'}
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
      <Dialog open={orderModalOpen} onClose={handleOrderModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Order Details
          <IconButton onClick={handleOrderModalClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {orderDetails ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Order #{orderDetails.orderNumber || orderDetails.id}</Typography>
              <Typography><b>Customer Name:</b> {orderDetails.customerName}</Typography>
              <Typography><b>Status:</b> {orderDetails.status}</Typography>
              <Typography><b>Date:</b> {orderDetails.date}</Typography>
              {/* Add more order fields as needed */}
            </Box>
          ) : (
            <Typography>No order details found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOrderModalClose}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Modal for overdue stage prompt */}
      <Dialog open={stagePrompt.open} onClose={handleCloseStagePrompt} maxWidth="xs" fullWidth>
        <DialogTitle>Stage Overdue</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>Has this stage been completed?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Button onClick={handleCompleteStage} color="success" variant="contained" sx={{ minWidth: 160, fontWeight: 700 }}>
            Yes, Mark Completed
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f5f5f5', borderRadius: 1, px: 1, py: 0.5 }}>
            <Typography sx={{ fontSize: 14 }}>Extend by</Typography>
            <TextField type="number" size="small" value={extendDays} onChange={e => setExtendDays(e.target.value)} sx={{ width: 60 }} />
            <Typography sx={{ fontSize: 14 }}>days</Typography>
            <Button onClick={handleExtendStage} color="warning" variant="outlined" sx={{ fontWeight: 700 }}>Extend</Button>
          </Box>
          <Button onClick={handleCloseStagePrompt} color="inherit" variant="text" sx={{ fontWeight: 700 }}>Cancel</Button>
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