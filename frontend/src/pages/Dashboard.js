import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, useMediaQuery, useTheme, Alert } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { DashboardAlertContext } from '../contexts/DashboardAlertContext';
import { apiGet } from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const barData1 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'OK Pieces',
      data: [120, 150, 170, 140, 180, 160, 170, 180, 190, 200, 210, 220],
      backgroundColor: '#e3e7ed',
      borderRadius: 6,
      barPercentage: 0.5,
    },
    {
      label: 'Rejected',
      data: [10, 8, 12, 7, 9, 6, 10, 8, 12, 7, 9, 6],
      backgroundColor: '#bfc8d9',
      borderRadius: 6,
      barPercentage: 0.5,
    },
  ],
};

const barData2 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Paid',
      data: [100, 120, 110, 130, 125, 140, 100, 120, 110, 130, 125, 140],
      backgroundColor: '#e3e7ed',
      borderRadius: 6,
      barPercentage: 0.5,
    },
    {
      label: 'Unpaid',
      data: [20, 30, 25, 20, 30, 25, 20, 30, 25, 20, 30, 25],
      backgroundColor: '#bfc8d9',
      borderRadius: 6,
      barPercentage: 0.5,
    },
  ],
};

const deadlines = [
  { icon: <LocalShippingIcon sx={{ color: '#222' }} />, label: 'Shipment for Customer A', date: '2024-07-15' },
  { icon: <AssignmentIcon sx={{ color: '#222' }} />, label: 'Inspection for Order B', date: '2024-07-20' },
  { icon: <PaymentIcon sx={{ color: '#222' }} />, label: 'Payment Due for Customer C', date: '2024-07-25' },
];

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { alerts } = useContext(DashboardAlertContext);
  const navigate = useNavigate();

  // Dynamic summary state
  const [summary, setSummary] = useState([
    { label: 'Total Shipments', value: 0 },
    { label: 'Pending Orders', value: 0 },
    { label: 'Stock Alert', value: 0 },
    { label: 'Payment Due', value: 0 },
  ]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const [shipments, orders, payments, inventory] = await Promise.all([
          apiGet('/api/shipments'),
          apiGet('/api/orders'),
          apiGet('/api/payments'),
          apiGet('/api/inventory'),
        ]);
        const totalShipments = shipments.length;
        const pendingOrders = orders.filter(o => (o.status || o.Status) === 'Pending Production').length;
        const stockAlert = inventory.filter(i => i.quantity && i.quantity < 10).length; // threshold 10
        const paymentDue = payments.filter(p => (p.status || p.Status) === 'Unpaid' || (p.status || p.Status) === 'Pending').reduce((sum, p) => sum + (p.amount || p.Amount || 0), 0);
        setSummary([
          { label: 'Total Shipments', value: totalShipments },
          { label: 'Pending Orders', value: pendingOrders },
          { label: 'Stock Alert', value: stockAlert },
          { label: 'Payment Due', value: paymentDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
        ]);
      } catch (err) {
        // fallback to zeros
        setSummary([
          { label: 'Total Shipments', value: 0 },
          { label: 'Pending Orders', value: 0 },
          { label: 'Stock Alert', value: 0 },
          { label: 'Payment Due', value: 0 },
        ]);
      }
    }
    fetchSummary();
  }, []);

  return (
    <Box sx={{ width: '100%', p: isMobile ? 1 : 3 }}>
      {alerts && alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert) => (
            <Alert severity="warning" sx={{ mb: 1 }} key={alert.id}>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: isMobile ? '2rem' : '2.4rem',
          mb: 3,
          color: '#181c25',
        }}
      >
        Dashboard
      </Typography>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summary.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                borderColor: '#e0e3e7',
                p: 0,
                minHeight: 90,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                bgcolor: '#fff',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderColor: '#bfc8d9',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => {
                // Navigate to the corresponding page based on the label
                if (item.label === 'Total Shipments') {
                  navigate('/shipments');
                } else if (item.label === 'Pending Orders') {
                  navigate('/orders');
                } else if (item.label === 'Stock Alert') {
                  navigate('/inventory');
                } else if (item.label === 'Payment Due') {
                  navigate('/payments');
                }
              }}
            >
              <CardContent sx={{ p: 2, pb: '16px!important' }}>
                <Typography sx={{ fontSize: '1rem', color: '#222', fontWeight: 500, mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#181c25' }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none', borderColor: '#e0e3e7', bgcolor: '#fff' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1, color: '#222' }}>
                Rejected vs OK Pieces (Monthly)
              </Typography>
              <Box sx={{ height: 200 }}>
                <Bar
                  data={barData1}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#bfc8d9', font: { size: 13 } },
                      },
                      y: {
                        grid: { color: '#f0f2f5' },
                        ticks: { color: '#bfc8d9', font: { size: 13 } },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none', borderColor: '#e0e3e7', bgcolor: '#fff' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1, color: '#222' }}>
                Paid vs Unpaid Shipments
              </Typography>
              <Box sx={{ height: 200 }}>
                <Bar
                  data={barData2}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#bfc8d9', font: { size: 13 } },
                      },
                      y: {
                        grid: { color: '#f0f2f5' },
                        ticks: { color: '#bfc8d9', font: { size: 13 } },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Timeline Deadlines */}
      <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', mb: 2, color: '#181c25' }}>
        Upcoming Deadlines
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none', borderColor: '#e0e3e7', bgcolor: '#fff', p: 2 }}>
        <Timeline sx={{ p: 0, m: 0 }}>
          {deadlines.map((d, idx) => (
            <TimelineItem key={d.label} sx={{ minHeight: 60 }}>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: '#e3e7ed', boxShadow: 'none' }}>{d.icon}</TimelineDot>
                {idx < deadlines.length - 1 && <TimelineConnector sx={{ bgcolor: '#e0e3e7' }} />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: 0.5 }}>
                <Typography sx={{ fontWeight: 600, color: '#222', fontSize: '1rem' }}>{d.label}</Typography>
                <Typography sx={{ color: '#1976d2', fontSize: '0.98rem', fontWeight: 500 }}>
                  Due Date: {d.date}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Card>
    </Box>
  );
}