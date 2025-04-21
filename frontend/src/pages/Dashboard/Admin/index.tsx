import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Primero navegar a login
      navigate('/login');
      // Luego hacer logout para limpiar el estado
      logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
      <Box>
        <Typography variant="body1">
          ¡Bienvenido al Dashboard!
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default Dashboard; 
 