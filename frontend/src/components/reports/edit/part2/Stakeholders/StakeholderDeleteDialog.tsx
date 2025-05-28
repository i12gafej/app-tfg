import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Stakeholder, stakeholderService } from '@/services/stakeholderService';

interface StakeholderDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  stakeholder: Stakeholder;
  token: string;
  onDelete: () => void;
}

export const StakeholderDeleteDialog: React.FC<StakeholderDeleteDialogProps> = ({
  open,
  onClose,
  stakeholder,
  token,
  onDelete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await stakeholderService.deleteStakeholder(stakeholder.id, token);
      onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar grupo de interés');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eliminar Grupo de Interés</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            ¿Está seguro que desea eliminar el grupo de interés "{stakeholder.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tipo: {stakeholder.type === 'internal' ? 'Interno' : 'Externo'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleDelete}
          variant="contained" 
          color="error"
          disabled={isLoading}
        >
          {isLoading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};