import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Stakeholder, StakeholderType, stakeholderService } from '@/services/stakeholderService';

interface StakeholderEditDialogProps {
  open: boolean;
  onClose: () => void;
  stakeholder: Stakeholder;
  token: string;
  onUpdate: () => void;
}

export const StakeholderEditDialog: React.FC<StakeholderEditDialogProps> = ({
  open,
  onClose,
  stakeholder,
  token,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: stakeholder.name,
    description: stakeholder.description,
    type: stakeholder.type
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: stakeholder.name,
        description: stakeholder.description,
        type: stakeholder.type
      });
      setError(null);
    }
  }, [open, stakeholder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await stakeholderService.updateStakeholder(stakeholder.id, {
        ...formData,
        report_id: stakeholder.report_id
      }, token);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar grupo de interés');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Grupo de Interés</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tipo"
              >
                <MenuItem value="internal">Interno</MenuItem>
                <MenuItem value="external">Externo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};