import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Divider,
  Button,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  CloudUpload,
  LocalShipping,
  Factory,
  People,
  Assignment,
  Payment,
  Inventory,
  Assessment,
  Settings,
  Menu,
  Logout,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Orders', icon: <Assignment />, path: '/orders' },
  { text: 'Upload Order (Smart Import)', icon: <CloudUpload />, path: '/uploadorder' },
  { text: 'Shipments', icon: <LocalShipping />, path: '/shipments' },
  { text: 'Production (Time & Action)', icon: <Factory />, path: '/production' },
  { text: 'Inspections', icon: <Assignment />, path: '/inspections' },
  { text: 'Payments', icon: <Payment />, path: '/payments' },
  { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const drawerWidth = isMobile ? 240 : isTablet ? 200 : 240;

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#f7f9fb', borderRight: 'none', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          pb: 2,
          textAlign: 'left',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: '#222',
          letterSpacing: 1,
        }}
      >
        IndustriTrack
      </Box>
      <Divider sx={{ mb: 1, borderColor: '#e0e3e7' }} />
      <List sx={{ flex: 1 }}>
        {menuItems.map((item, idx) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                minHeight: 44,
                bgcolor: location.pathname === item.path ? '#f0f2f5' : 'transparent',
                border: location.pathname === item.path ? '1.5px solid #d1d7e0' : '1.5px solid transparent',
                boxShadow: location.pathname === item.path ? '0 2px 8px 0 rgba(60,60,60,0.04)' : 'none',
                color: '#222',
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#222', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: '1rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* User Profile and Logout Section */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e3e7' }}>
        {user && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#0080ff' }}>
              <Person sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: '0.875rem' }}>
                {user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            color: '#666',
            borderColor: '#d1d7e0',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#ff4444',
              color: '#ff4444',
              bgcolor: '#fff5f5',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <Menu />
        </IconButton>
      )}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              bgcolor: '#f7f9fb',
              boxShadow: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
} 