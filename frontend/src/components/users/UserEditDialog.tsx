import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Alert,
  Typography
} from '@mui/material';
import { User } from '@/services/userService';

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<void>;
  user: User | null;
}

const UserEditDialog = ({ open, onClose, onSave, user }: UserEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    surname: '',
    email: '',
    admin: false,
    phone_number: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  
  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email,
        admin: user.admin,
        phone_number: user.phone_number
      });
      setError(null);
      setShowConfirmation(false);
    }
  }, [user, open]);

  const handleChange = (field: keyof User, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(formData);
      setShowConfirmation(false);
      onClose();
    } catch (err: any) {
      if (err.response?.data?.detail?.includes('email')) {
        setError('Este correo ya está en uso por otro usuario');
      } else {
        setError('Error al actualizar el usuario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (!user) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              label="Apellidos"
              value={formData.surname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('surname', e.target.value)}
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
              variant="outlined"
              size="small"
              type="email"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.admin}
                label="Rol"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('admin', e.target.value === 'true')}
              >
                <MenuItem value="false">Usuario</MenuItem>
                <MenuItem value="true">Administrador</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone_number || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone_number', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showConfirmation}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Cambios</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas guardar los cambios realizados?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCancel}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserEditDialog; 