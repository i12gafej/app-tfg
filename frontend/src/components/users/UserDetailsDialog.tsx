import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { User } from '@/services/userService';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  user: User | null;
  readOnly?: boolean;
}

const UserDetailsDialog = ({ open, onClose, onEdit, user, readOnly }: UserDetailsDialogProps) => {
  if (!user) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detalles del Usuario</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">Nombre</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{user.name}</Typography>

          <Typography variant="subtitle1" color="text.secondary">Apellidos</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{user.surname}</Typography>

          <Typography variant="subtitle1" color="text.secondary">Correo electrónico</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{user.email}</Typography>

          <Typography variant="subtitle1" color="text.secondary">Rol</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{user.admin ? 'Administrador' : 'Usuario'}</Typography>

          <Typography variant="subtitle1" color="text.secondary">Teléfono</Typography>
          <Typography variant="body1">{user.phone_number || 'No especificado'}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {!readOnly && (
        <Button 
          variant="contained" 
          onClick={onEdit}
          sx={{ minWidth: 120 }}
        >
          Editar
        </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog; 