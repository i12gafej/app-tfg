import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { DiagnosticIndicator } from '@/services/diagnosisIndicatorService';

interface DiagnosisIndicatorsDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  indicator: DiagnosticIndicator | null;
}

const DiagnosisIndicatorsDeleteDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  indicator 
}: DiagnosisIndicatorsDeleteDialogProps) => {
  if (!indicator) return null;

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
          ¿Estás seguro de que deseas eliminar el indicador "{indicator.name}"?
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

export default DiagnosisIndicatorsDeleteDialog;
