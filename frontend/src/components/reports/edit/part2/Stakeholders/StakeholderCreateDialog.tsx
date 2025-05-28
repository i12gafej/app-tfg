import React, { useState } from 'react';
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
  Alert,
} from '@mui/material';
import { Stakeholder, StakeholderType } from '@/services/stakeholderService';

interface StakeholderCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onStakeholderCreated: (stakeholder: Stakeholder) => void;
  token: string;
  reportId: number;
}

export const StakeholderCreateDialog: React.FC<StakeholderCreateDialogProps> = ({
  open,
  onClose,
  onStakeholderCreated,
  token,
  reportId,
}) => {
  const initialFormData = {
    name: '',
    description: '',
    type: 'internal' as StakeholderType,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/stakeholders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          report_id: reportId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear el grupo de interés');
      }

      const newStakeholder = await response.json();
      onStakeholderCreated(newStakeholder);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al crear el grupo de interés');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Grupo de Interés</DialogTitle>
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
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Grupo de Interés'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};