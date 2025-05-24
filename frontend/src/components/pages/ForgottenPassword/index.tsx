import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  LinearProgress,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import { userService } from '@/services/userService';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let level = 0;
  if (password.length >= 8) level++;
  if (/[A-Z]/.test(password)) level++;
  if (/[0-9]/.test(password)) level++;
  if (/[^A-Za-z0-9]/.test(password)) level++;
  if (password.length >= 12) level++;
  if (level <= 1) return { level: 20, label: 'Débil', color: '#e57373' };
  if (level === 2) return { level: 40, label: 'Regular', color: '#ffb74d' };
  if (level === 3) return { level: 60, label: 'Aceptable', color: '#fff176' };
  if (level === 4) return { level: 80, label: 'Fuerte', color: '#81c784' };
  return { level: 100, label: 'Muy fuerte', color: '#388e3c' };
}

const ForgottenPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);
  const confirmError = confirmPassword.length > 0 && newPassword !== confirmPassword;

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token no válido');
      return;
    }
    setToken(tokenParam);
    verifyToken(tokenParam);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await userService.verifyResetToken(token);
      setEmail(response.email);
    } catch (error) {
      setError('El enlace ha expirado o no es válido. Serás redirigido a la página de inicio en 10 segundos...');
      setTimeout(() => {
        navigate('/');
      }, 10000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      await userService.resetPassword(token, newPassword);
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError('Error al actualizar la contraseña');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: { xs: 6, sm: 10 },
          mb: 6,
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 4 },
            maxWidth: 420,
            width: '100%',
            boxShadow: 6,
          }}
          elevation={6}
        >
          <Typography variant="h5" fontWeight={600} gutterBottom align="center" sx={{ mb: 2 }}>
            Cambiar Contraseña
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {success}
            </Alert>
          )}
          <Stack spacing={3}>
            <TextField
              label="Email"
              value={email}
              disabled
              fullWidth
            />
            <Box>
              <TextField
                label="Nueva contraseña"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                fullWidth
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew((v) => !v)} edge="end" size="small">
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {newPassword && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.level}
                    sx={{ height: 8, borderRadius: 2, background: '#eee', '& .MuiLinearProgress-bar': { background: passwordStrength.color } }}
                  />
                  <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600 }}>
                    Seguridad: {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>
            <TextField
              label="Confirmar nueva contraseña"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              fullWidth
              error={confirmError}
              helperText={confirmError ? 'Las contraseñas no coinciden' : ''}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              startIcon={<LockResetIcon />}
              sx={{ fontWeight: 600, fontSize: '1rem', py: 1.2 }}
            >
              Cambiar contraseña
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgottenPassword; 