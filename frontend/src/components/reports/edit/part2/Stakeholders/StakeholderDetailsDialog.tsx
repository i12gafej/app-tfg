import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Stakeholder } from '@/services/stakeholderService';

interface StakeholderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  stakeholder: Stakeholder;
  onEdit: () => void;
}

export const StakeholderDetailsDialog: React.FC<StakeholderDetailsDialogProps> = ({
  open,
  onClose,
  stakeholder,
  onEdit
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalles del Grupo de Interés</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {stakeholder.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tipo: {stakeholder.type === 'internal' ? 'Interno' : 'Externo'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="body1" paragraph>
            {stakeholder.description}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        <Button 
          onClick={() => {
            onEdit();
            onClose();
          }}
          variant="contained"
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};