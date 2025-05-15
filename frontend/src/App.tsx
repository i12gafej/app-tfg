import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AuthProvider from '@/context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout
import NavbarController from '@/components/layout/NavbarController';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import MainContent from './components/layout/MainContent';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Reports from './pages/Reports/index';
import Surveys from './pages/Surveys/index';
import Contact from './pages/Contact/index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Backup from './pages/Backup/index';
import Dashboard from './pages/Dashboard/Admin';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Team from './pages/Team';
import ReportNavController from './components/reports/ReportNavController';
import ProfilePage from './pages/Account/index';
import ChangePassword from './pages/ChangePassword';

const App = () => {
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
            <Route path="/quienes-somos" element={<About />} />
            <Route path="/memorias/*" element={<ReportNavController />} />
            <Route path="/encuestas" element={<Surveys />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
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