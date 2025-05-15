import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import { Container } from '@mui/material';

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
      <Container maxWidth="xl" sx={{py:6}}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
        <Typography variant="body1">
          ¡Bienvenido al Dashboard!
        </Typography>
      </Box>
      </Container>
      
    </PageContainer>
  );
};

export default Dashboard; 
 