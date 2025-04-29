import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { materialTopicService, MaterialTopic, PriorityLevel } from '@/services/materialTopicService';

interface MaterialTopicEditDialogProps {
  open: boolean;
  onClose: () => void;
  materialTopic: MaterialTopic;
  token: string;
  onUpdate: () => void;
}

export const MaterialTopicEditDialog: React.FC<MaterialTopicEditDialogProps> = ({
  open,
  onClose,
  materialTopic,
  token,
  onUpdate
}) => {
  const [name, setName] = useState(materialTopic.name);
  const [description, setDescription] = useState(materialTopic.description || '');
  const [priority, setPriority] = useState<PriorityLevel | ''>(materialTopic.priority || '');
  const [mainObjective, setMainObjective] = useState(materialTopic.main_objective || '');
  const [goalOdsId, setGoalOdsId] = useState(materialTopic.goal_ods_id?.toString() || '');
  const [goalNumber, setGoalNumber] = useState(materialTopic.goal_number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(materialTopic.name);
      setDescription(materialTopic.description || '');
      setPriority(materialTopic.priority || '');
      setMainObjective(materialTopic.main_objective || '');
      setGoalOdsId(materialTopic.goal_ods_id?.toString() || '');
      setGoalNumber(materialTopic.goal_number || '');
      setError(null);
    }
  }, [open, materialTopic]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData: Partial<MaterialTopic> = {
        name: name.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
        main_objective: mainObjective.trim() || undefined,
        goal_ods_id: goalOdsId ? parseInt(goalOdsId) : undefined,
        goal_number: goalNumber.trim() || undefined
      };

      await materialTopicService.updateMaterialTopic(materialTopic.id, updateData, token);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error al actualizar asunto relevante:', err);
      setError('Error al actualizar el asunto relevante. Por favor, inténtalo de nuevo.');
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
        Editar Asunto Relevante
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

          <FormControl fullWidth margin="normal">
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={priority}
              label="Prioridad"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setPriority(e.target.value as PriorityLevel)}
            >
              <MenuItem value="">Ninguna</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="low">Baja</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Objetivo Principal"
            value={mainObjective}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMainObjective(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="ODS ID"
              value={goalOdsId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalOdsId(e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="Número de Meta"
              value={goalNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalNumber(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialTopicEditDialog;


