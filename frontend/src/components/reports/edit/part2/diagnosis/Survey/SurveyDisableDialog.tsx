import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface SurveyDisableDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SurveyDisableDialog: React.FC<SurveyDisableDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Desactivar Encuesta</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas desactivar la encuesta? Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
        >
          Desactivar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyDisableDialog;

