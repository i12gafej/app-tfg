import React, { useContext, useState } from 'react';
import { Box, Typography, Paper, Button, Divider, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import { AuthContext } from '@/context/auth.context';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import { Account, userService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;
  const navigate = useNavigate();

  // Estado para el diálogo de edición
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Account>({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEditOpen = () => {
    setForm({
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
    });
    setEditOpen(true);
    setSuccess(null);
    setError(null);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSuccess(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const updated = await userService.updateAccount(user?.id.toString() || '', form, token);
      setSuccess('Datos actualizados correctamente');
      // Actualizar el contexto de usuario si es posible
      if (auth?.login && auth?.user) {
        auth.login(token, { ...auth.user, ...form });
      }
      setEditOpen(false);
    } catch (err: any) {
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Perfil de Usuario
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body1">
              {user?.name || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Apellidos
            </Typography>
            <Typography variant="body1">
              {user?.surname || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Correo electrónico
            </Typography>
            <Typography variant="body1">
              {user?.email || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Número de teléfono
            </Typography>
            <Typography variant="body1">
              {user?.phone_number || '-'}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LockResetIcon />}
            fullWidth
            onClick={() => navigate('/perfil/cambiar-contrasena')}
          >
            Cambiar contraseña
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            fullWidth
            onClick={handleEditOpen}
          >
            Modificar datos
          </Button>
        </Stack>
        {/* Feedback global */}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {/* Diálogo de edición */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Modificar datos</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Apellidos"
              name="surname"
              value={form.surname || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Correo electrónico"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              fullWidth
              type="email"
            />
            <TextField
              label="Número de teléfono"
              name="phone_number"
              value={form.phone_number || ''}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
