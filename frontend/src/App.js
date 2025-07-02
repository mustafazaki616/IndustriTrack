import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardAlertProvider } from './contexts/DashboardAlertContext';
import MainLayout from './components/MainLayout';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Inspections from './pages/Inspections';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Payments from './pages/Payments';
import Production from './pages/Production';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Shipments from './pages/Shipments';
import Signup from './pages/Signup';
import UploadOrder from './pages/UploadOrder';

function App() {
  return (
    <DashboardAlertProvider>
      <AuthProvider>
        <Router>
          <MainLayout>
            <Sidebar />
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inspections" element={<Inspections />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/login" element={<Login />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/production" element={<Production />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/uploadorder" element={<UploadOrder />} />
              <Route path="/upload-order" element={<UploadOrder />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </DashboardAlertProvider>
  );
}

export default App; 