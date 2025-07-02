import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 1 : isTablet ? 1.5 : 2,
          width: { sm: `calc(100% - ${isMobile ? 240 : isTablet ? 200 : 240}px)` },
          ml: { sm: `${isMobile ? 240 : isTablet ? 200 : 240}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 