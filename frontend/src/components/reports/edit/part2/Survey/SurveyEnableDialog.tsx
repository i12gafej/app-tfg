import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert
} from '@mui/material';

interface SurveyEnableDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (scale: number) => void;
  currentScale: number;
  isEdit?: boolean;
}

const SurveyEnableDialog: React.FC<SurveyEnableDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentScale,
  isEdit = false
}) => {
  const [scale, setScale] = useState(currentScale.toString());
  const [error, setError] = useState<string | null>(null);

  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setScale(value);
    
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 1) {
      setError('La escala debe ser un número mayor que 1');
    } else {
      setError(null);
    }
  };

  const handleConfirm = () => {
    const numScale = Number(scale);
    if (isNaN(numScale) || numScale <= 1) {
      setError('La escala debe ser un número mayor que 1');
      return;
    }
    onConfirm(numScale);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isEdit ? 'Editar Escala de la Encuesta' : 'Activar Encuesta'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Escala"
          type="number"
          fullWidth
          value={scale}
          onChange={handleScaleChange}
          error={!!error}
          helperText={error}
          inputProps={{ min: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!!error}
        >
          {isEdit ? 'Actualizar' : 'Activar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyEnableDialog;

