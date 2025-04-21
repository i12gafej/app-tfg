import { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/context/auth.context';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      console.log('Respuesta completa del login:', response);
      
      if (!response.user) {
        console.error('No se recibió información del usuario en la respuesta');
        throw new Error('Error en la respuesta del servidor');
      }
      
      // Convertir la respuesta a tipo User
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        admin: response.user.admin,
        name: response.user.name,
        surname: response.user.surname,
        phone_number: response.user.phone_number
      };
      
      console.log('Datos del usuario convertidos:', userData);
      
      login(response.access_token, userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en el login:', err);
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer whiteBackground>
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            mt: { xs: 4, sm: 8 }, 
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              color: '#2F2F2F',
              mb: 4,
              fontWeight: 600
            }}
          >
            Iniciar Sesión
          </Typography>
          <Paper 
            elevation={2}
            sx={{ 
              p: 4,
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              width: '100%',
              boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Correo electrónico"
                variant="outlined"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Contraseña"
                variant="outlined"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  mt: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: '#000000',
                  '&:hover': {
                    backgroundColor: '#333333'
                  }
                }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Acceder'}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Login; 