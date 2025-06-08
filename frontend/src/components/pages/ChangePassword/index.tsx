import React, { useState, useContext } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Alert, Divider, LinearProgress, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '@/services/userService';
import { AuthContext } from '@/context/auth.context';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface ChangePasswordProps {
  edit?: boolean;
}

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

const ChangePassword: React.FC<ChangePasswordProps> = ({ edit = true }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const token = auth?.token;

  const passwordStrength = getPasswordStrength(newPassword);
  const confirmError = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Por favor, rellena todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (!token) {
      setError('No autenticado.');
      return;
    }
    setLoading(true);
    try {
      await userService.changePassword(String(auth?.user?.id || ''), oldPassword, newPassword, token);
      setSuccess('Contraseña cambiada correctamente.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      setError('Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/perfil');
    }
  };

  return (
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
          Cambiar contraseña
        </Typography>
        <Stack spacing={3}>
          <Box>
            <TextField
              label="Contraseña actual"
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
              fullWidth
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOld((v) => !v)} edge="end" size="small">
                      {showOld ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Divider sx={{ my: 0 }} />
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
          <Box>
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
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
              disabled={loading}
              fullWidth
              startIcon={<LockResetIcon />}
              sx={{ fontWeight: 600, fontSize: '1rem', py: 1.2 }}
            >
              Cambiar contraseña
            </Button>
            {edit && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                fullWidth
                sx={{ fontWeight: 600, fontSize: '1rem', py: 1.2 }}
              >
                Cancelar
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
