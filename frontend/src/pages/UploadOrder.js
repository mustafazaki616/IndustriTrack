import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const mockExtractedData = [
  { article: 'Leather Jacket', customer: 'Fashion Forward Inc.', xs: 10, s: 20, m: 30, l: 20, xl: 10, quantity: 90 },
  { article: 'Cotton T-Shirt', customer: 'Trendsetters LLC', xs: 15, s: 25, m: 35, l: 25, xl: 15, quantity: 115 },
  { article: 'Denim Jeans', customer: 'Style Hub Co.', xs: 20, s: 30, m: 40, l: 30, xl: 20, quantity: 140 },
  { article: 'Silk Scarf', customer: 'Luxury Linens Ltd.', xs: 5, s: 10, m: 15, l: 10, xl: 5, quantity: 45 },
  { article: 'Wool Sweater', customer: 'Cozy Comforts', xs: 12, s: 18, m: 24, l: 18, xl: 12, quantity: 84 },
];

export default function UploadOrder() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

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
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#181c25' }}>
        Extracted Order Data Preview
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>Article Name</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Size XS</TableCell>
              <TableCell>Size S</TableCell>
              <TableCell>Size M</TableCell>
              <TableCell>Size L</TableCell>
              <TableCell>Size XL</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockExtractedData.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.article}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.xs}</TableCell>
                <TableCell>{row.s}</TableCell>
                <TableCell>{row.m}</TableCell>
                <TableCell>{row.l}</TableCell>
                <TableCell>{row.xl}</TableCell>
                <TableCell>{row.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" sx={{ bgcolor: '#0080ff', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, float: 'right' }}>
        Confirm & Save
      </Button>
    </Box>
  );
} 