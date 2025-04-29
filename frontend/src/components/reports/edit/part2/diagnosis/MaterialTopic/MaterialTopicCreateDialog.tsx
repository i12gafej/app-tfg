import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert
} from '@mui/material';
import { materialTopicService } from '@/services/materialTopicService';

interface MaterialTopicCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onMaterialTopicCreated: () => void;
  token: string;
  reportId: number;
}

export const MaterialTopicCreateDialog: React.FC<MaterialTopicCreateDialogProps> = ({
  open,
  onClose,
  onMaterialTopicCreated,
  token,
  reportId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await materialTopicService.createMaterialTopic({
        name: name.trim(),
        description: description.trim(),
        report_id: reportId
      }, token);

      onMaterialTopicCreated();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error al crear asunto relevante:', err);
      setError('Error al crear el asunto relevante. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Nuevo Asunto Relevante
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nombre"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            margin="normal"
            required
            error={!!error && !name.trim()}
            helperText={error && !name.trim() ? 'El nombre es obligatorio' : ''}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


