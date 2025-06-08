import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import AuthProvider from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';


import NavbarController from '@/components/layout/NavbarController';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import MainContent from '@/components/layout/MainContent';


import Home from '@/components/pages/Home/index';
import Surveys from '@/components/pages/Surveys/index';
import Contact from '@/components/pages/Contact/index';
import Login from '@/components/pages/Login/index';
import NotFound from '@/components/pages/NotFound/index';
import Privacy from '@/components/pages/Privacy/index';
import Backup from '@/components/pages/Backup/index';
import Dashboard from '@/components/pages/Dashboard/index';
import Users from '@/components/pages/Users/index';
import Resources from '@/components/pages/Resources/index';
import Team from '@/components/pages/Team/index';
import ReportNavController from '@/components/reports/ReportNavController';
import ProfilePage from '@/components/pages/Account/index';
import ChangePassword from '@/components/pages/ChangePassword/index';
import PublicReports from '@/components/pages/Reports/index';
import ForgottenPassword from '@/components/pages/ForgottenPassword/index';

const App = () => {
  
  
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
  }, []);

  return (
    <AuthProvider>
      <Box
      
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: '#F6F1C5',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <NavbarController />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/memorias/*" element={<ReportNavController />} />
            <Route path="/memorias-publicas" element={<PublicReports />} />
            <Route path="/encuestas" element={<Surveys />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recursos" 
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipo" 
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/backup" 
              element={
                <ProtectedRoute>
                  <Backup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/perfil/cambiar-contrasena" 
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } 
            />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/restaurar-contrasena" element={<ForgottenPassword />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </MainContent>
        <Footer />
        <ScrollToTop />
      </Box>
    </AuthProvider>
  );
};

export default App; 