import { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert, Checkbox, FormControlLabel, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/auth.context';
import { User } from '@/context/auth.context';
import { emailService } from '@/services/emailService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Cargar el correo guardado al iniciar
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberEmail(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRememberEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberEmail(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem('rememberedEmail');
    }
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
      
      // Guardar el correo si se marcó la opción
      if (rememberEmail) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
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

  const handleResetPassword = async () => {
    setResetError('');
    setIsResetLoading(true);
    try {
      await emailService.sendChangePasswordVerification(resetEmail);
      setIsDialogOpen(false);
      alert('Se ha enviado un correo con las instrucciones para cambiar tu contraseña');
    } catch (error) {
      setResetError('Error al enviar el correo. Por favor, inténtalo de nuevo.');
    } finally {
      setIsResetLoading(false);
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
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberEmail}
                      onChange={handleRememberEmailChange}
                      disabled={isLoading}
                    />
                  }
                  label="Recordar mi correo"
                />
                <Link
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    setIsDialogOpen(true);
                  }}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  ¿Has olvidado tu contraseña?
                </Link>
              </Box>
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

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Introduce tu correo electrónico y te enviaremos las instrucciones para cambiar tu contraseña.
            </Typography>
            {resetError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {resetError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Correo electrónico"
              type="email"
              fullWidth
              value={resetEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
              disabled={isResetLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)} disabled={isResetLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleResetPassword} 
              variant="contained"
              disabled={isResetLoading || !resetEmail}
            >
              {isResetLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
};

export default Login; 