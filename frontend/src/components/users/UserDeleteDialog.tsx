import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { User } from '@/services/userService';

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
}

const UserDeleteDialog = ({ open, onClose, onConfirm, user }: UserDeleteDialogProps) => {
  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas eliminar al usuario {user.name} {user.surname} ({user.email})?
          Esta acción no se puede deshacer.
        </Typography>
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
          color="error"
          onClick={onConfirm}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDeleteDialog; 