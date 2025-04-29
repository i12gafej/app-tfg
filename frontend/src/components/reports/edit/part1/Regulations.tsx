import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Button,
  Paper,
  Alert
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import { useReport } from '@/contexts/ReportContext';
import { reportService } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';
import { ReportNorm } from '@/services/reportServices';

interface PendingChange {
  type: 'create' | 'update' | 'delete';
  norm: ReportNorm;
  originalNorm?: ReportNorm;
}

const Regulations = () => {
  const { report, loading: reportLoading } = useReport();
  const { token } = useAuth();
  const [regulations, setRegulations] = useState<ReportNorm[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar normativas iniciales
  useEffect(() => {
    const loadNorms = async () => {
      if (!report?.id || !token) return;
      
      try {
        const norms = await reportService.getReportNorms(report.id, token);
        setRegulations(norms);
      } catch (err) {
        console.error('Error al cargar las normativas:', err);
        setError('Error al cargar las normativas. Por favor, recarga la página.');
      }
    };

    loadNorms();
  }, [report?.id, token]);

  const addRegulation = () => {
    const newNorm: ReportNorm = {
      id: Date.now(), // ID temporal para cambios pendientes
      norm: '',
      report_id: report?.id || 0
    };
    
    setRegulations([...regulations, newNorm]);
    setPendingChanges([...pendingChanges, { type: 'create', norm: newNorm }]);
  };

  const removeRegulation = (id: number) => {
    const normToRemove = regulations.find(r => r.id === id);
    if (!normToRemove) return;

    setRegulations(regulations.filter(r => r.id !== id));
    
    // Si es una normativa nueva (creada en esta sesión), la eliminamos de los cambios pendientes
    if (id > 1000000) { // IDs temporales son grandes
      setPendingChanges(pendingChanges.filter(change => change.norm.id !== id));
    } else {
      // Si es una normativa existente, la marcamos para eliminación
      setPendingChanges([...pendingChanges, { type: 'delete', norm: normToRemove }]);
    }
  };

  const handleRegulationChange = (id: number, newText: string) => {
    const normToUpdate = regulations.find(r => r.id === id);
    if (!normToUpdate) return;

    const updatedNorm = { ...normToUpdate, norm: newText };
    setRegulations(regulations.map(r => r.id === id ? updatedNorm : r));

    // Si es una normativa nueva, actualizamos el cambio pendiente de creación
    if (id > 1000000) {
      setPendingChanges(pendingChanges.map(change => 
        change.norm.id === id ? { ...change, norm: updatedNorm } : change
      ));
    } else {
      // Si es una normativa existente, la marcamos para actualización
      const existingChange = pendingChanges.find(change => 
        change.type === 'update' && change.norm.id === id
      );

      if (existingChange) {
        setPendingChanges(pendingChanges.map(change => 
          change.norm.id === id ? { ...change, norm: updatedNorm } : change
        ));
      } else {
        setPendingChanges([...pendingChanges, { 
          type: 'update', 
          norm: updatedNorm,
          originalNorm: normToUpdate
        }]);
      }
    }
  };

  const saveChanges = async () => {
    if (!report || !token || pendingChanges.length === 0) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Filtrar normativas vacías
      const validChanges = pendingChanges.filter(change => {
        const normText = change.norm.norm.trim();
        return normText.length > 0;
      });

      if (validChanges.length === 0) {
        setError('No hay cambios válidos para guardar. Las normativas no pueden estar vacías.');
        setIsSaving(false);
        return;
      }

      // Procesar cambios en orden: primero eliminaciones, luego actualizaciones, finalmente creaciones
      const deletions = validChanges.filter(change => change.type === 'delete');
      const updates = validChanges.filter(change => change.type === 'update');
      const creations = validChanges.filter(change => change.type === 'create');

      // Ejecutar eliminaciones
      for (const change of deletions) {
        await reportService.deleteNorm(change.norm.id, token);
      }

      // Ejecutar actualizaciones
      for (const change of updates) {
        await reportService.updateNorm(report.id, change.norm.id, change.norm.norm, token);
      }

      // Ejecutar creaciones
      for (const change of creations) {
        await reportService.createNorm(report.id, change.norm.norm, token);
      }

      // Obtener las normativas actualizadas
      const updatedNorms = await reportService.getReportNorms(report.id, token);
      setRegulations(updatedNorms);

      setPendingChanges([]);
      setSuccessMessage('Cambios guardados correctamente');
    } catch (err) {
      console.error('Error al guardar los cambios:', err);
      setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6">
          Normativa
        </Typography>
        {pendingChanges.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {regulations.map((regulation) => (
        <Paper 
          key={regulation.id}
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 2, 
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Introduce la normativa..."
            value={regulation.norm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegulationChange(regulation.id, e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton 
            onClick={() => removeRegulation(regulation.id)}
            color="error"
            size="small"
            sx={{ mt: 1 }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Paper>
      ))}

      <Button
        startIcon={<AddCircleOutlineIcon />}
        onClick={addRegulation}
        variant="outlined"
        sx={{ mt: 1 }}
        disabled={reportLoading}
      >
        Añadir normativa
      </Button>
    </Box>
  );
};

export default Regulations; 