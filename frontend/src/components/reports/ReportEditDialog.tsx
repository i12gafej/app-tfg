import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography
} from '@mui/material';
import { reportService } from '@/services/reportServices';
import { useAuth } from '@/context/auth.context';

interface ReportEditDialogProps {
  open: boolean;
  onClose: () => void;
  reportId: number;
  reportName: string;
  year: string;
  initialObservation?: string;
  initialIsTemplate?: boolean;
}

const ReportEditDialog: React.FC<ReportEditDialogProps> = ({
  open,
  onClose,
  reportId,
  reportName,
  year,
  initialObservation = '',
  initialIsTemplate = false
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [observation, setObservation] = useState(initialObservation);
  const [isTemplate, setIsTemplate] = useState(initialIsTemplate);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setObservation(initialObservation);
    setIsTemplate(initialIsTemplate);
    setHasChanges(false);
  }, [initialObservation, initialIsTemplate]);

  const handleObservationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setObservation(event.target.value);
    setHasChanges(true);
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTemplate(event.target.checked);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);
      setError(null);
      await reportService.updateReport(
        reportId,
        {
          observation,
          template: isTemplate
        },
        token
      );
      setHasChanges(false);
    } catch (err) {
      setError('Error al guardar los cambios');
      console.error('Error al guardar:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    onClose();
    navigate(`/memorias/editar/${reportId}/${reportName}/${year}`);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          Edición de la Memoria
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {reportName} - {year}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Observación"
            value={observation}
            onChange={handleObservationChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isTemplate}
                onChange={handleTemplateChange}
              />
            }
            label="Es una plantilla"
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        {hasChanges && (
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        )}
        <Button 
          onClick={handleEdit}
          variant="contained"
          color="primary"
        >
          Editar Memoria
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportEditDialog;
