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
import { materialTopicService, MaterialTopic } from '@/services/materialTopicService';

interface MaterialTopicDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  materialTopic: MaterialTopic;
  token: string;
  onDelete: () => void;
}

export const MaterialTopicDeleteDialog: React.FC<MaterialTopicDeleteDialogProps> = ({
  open,
  onClose,
  materialTopic,
  token,
  onDelete
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      await materialTopicService.deleteMaterialTopic(materialTopic.id, token);
      onDelete();
      onClose();
    } catch (err) {
      console.error('Error al eliminar asunto relevante:', err);
      setError('Error al eliminar el asunto relevante. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Eliminar Asunto Relevante
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography>
            ¿Estás seguro de que deseas eliminar el asunto relevante "{materialTopic.name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


