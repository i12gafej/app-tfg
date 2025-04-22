import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';
import { Resource } from '@/services/resourceService';
import { useState } from 'react';

interface ResourceDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  resource: Resource | null;
}

const ResourceDeleteDialog = ({ open, onClose, onConfirm, resource }: ResourceDeleteDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setError('Error al eliminar el recurso. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Eliminar Recurso</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>
          ¿Estás seguro de que deseas eliminar el recurso "{resource.name}"?
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
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

export default ResourceDeleteDialog; 