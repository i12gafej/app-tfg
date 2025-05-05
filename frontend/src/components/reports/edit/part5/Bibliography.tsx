import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import { useReport } from '@/context/ReportContext';
import { reportService, ReportBibliography } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';

interface PendingChange {
  type: 'create' | 'update' | 'delete';
  bibliography: ReportBibliography;
  originalBibliography?: ReportBibliography;
}

const Bibliography = () => {
  const { report, loading: reportLoading, readOnly } = useReport();
  const { token } = useAuth();
  const [bibliographies, setBibliographies] = useState<ReportBibliography[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar referencias bibliográficas iniciales
  useEffect(() => {
    const loadBibliographies = async () => {
      if (!report?.id || !token) return;
      
      try {
        const bibliographies = await reportService.getReportBibliographies(report.id, token);
        setBibliographies(bibliographies);
      } catch (err) {
        console.error('Error al cargar las referencias bibliográficas:', err);
        setError('Error al cargar las referencias bibliográficas. Por favor, recarga la página.');
      }
    };

    loadBibliographies();
  }, [report?.id, token]);

  const addBibliography = () => {
    const newBibliography: ReportBibliography = {
      id: Date.now(), // ID temporal para cambios pendientes
      reference: '',
      report_id: report?.id || 0
    };
    
    setBibliographies([...bibliographies, newBibliography]);
    setPendingChanges([...pendingChanges, { type: 'create', bibliography: newBibliography }]);
  };

  const removeBibliography = (id: number) => {
    const bibliographyToRemove = bibliographies.find(b => b.id === id);
    if (!bibliographyToRemove) return;

    setBibliographies(bibliographies.filter(b => b.id !== id));
    
    // Si es una referencia nueva (creada en esta sesión), la eliminamos de los cambios pendientes
    if (id > 1000000) { // IDs temporales son grandes
      setPendingChanges(pendingChanges.filter(change => change.bibliography.id !== id));
    } else {
      // Si es una referencia existente, la marcamos para eliminación
      setPendingChanges([...pendingChanges, { type: 'delete', bibliography: bibliographyToRemove }]);
    }
  };

  const handleBibliographyChange = (id: number, newText: string) => {
    const bibliographyToUpdate = bibliographies.find(b => b.id === id);
    if (!bibliographyToUpdate) return;

    const updatedBibliography = { ...bibliographyToUpdate, reference: newText };
    setBibliographies(bibliographies.map(b => b.id === id ? updatedBibliography : b));

    // Si es una referencia nueva, actualizamos el cambio pendiente de creación
    if (id > 1000000) {
      setPendingChanges(pendingChanges.map(change => 
        change.bibliography.id === id ? { ...change, bibliography: updatedBibliography } : change
      ));
    } else {
      // Si es una referencia existente, la marcamos para actualización
      const existingChange = pendingChanges.find(change => 
        change.type === 'update' && change.bibliography.id === id
      );

      if (existingChange) {
        setPendingChanges(pendingChanges.map(change => 
          change.bibliography.id === id ? { ...change, bibliography: updatedBibliography } : change
        ));
      } else {
        setPendingChanges([...pendingChanges, { 
          type: 'update', 
          bibliography: updatedBibliography,
          originalBibliography: bibliographyToUpdate
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
      // Filtrar referencias vacías
      const validChanges = pendingChanges.filter(change => {
        const referenceText = change.bibliography.reference.trim();
        return referenceText.length > 0;
      });

      if (validChanges.length === 0) {
        setError('No hay cambios válidos para guardar. Las referencias bibliográficas no pueden estar vacías.');
        setIsSaving(false);
        return;
      }

      // Procesar cambios en orden: primero eliminaciones, luego actualizaciones, finalmente creaciones
      const deletions = validChanges.filter(change => change.type === 'delete');
      const updates = validChanges.filter(change => change.type === 'update');
      const creations = validChanges.filter(change => change.type === 'create');

      // Ejecutar eliminaciones
      for (const change of deletions) {
        await reportService.deleteBibliography(change.bibliography.id, token);
      }

      // Ejecutar actualizaciones
      for (const change of updates) {
        await reportService.updateBibliography(
          report.id, 
          change.bibliography.id, 
          change.bibliography.reference, 
          token
        );
      }

      // Ejecutar creaciones
      for (const change of creations) {
        await reportService.createBibliography(
          report.id, 
          change.bibliography.reference, 
          token
        );
      }

      // Obtener las referencias actualizadas
      const updatedBibliographies = await reportService.getReportBibliographies(report.id, token);
      setBibliographies(updatedBibliographies);

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
          Referencias Bibliográficas
        </Typography>
        {!readOnly && pendingChanges.length > 0 && (
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
      
      {readOnly ? (
        <List sx={{ 
          width: '100%',
          bgcolor: 'background.paper',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {bibliographies.map((bibliography, index) => (
            <React.Fragment key={bibliography.id}>
              <ListItem>
                <ListItemText 
                  primary={bibliography.reference}
                  sx={{
                    '& .MuiListItemText-primary': {
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }
                  }}
                />
              </ListItem>
              {index < bibliographies.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <>
          {bibliographies.map((bibliography) => (
            <Paper 
              key={bibliography.id}
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
                placeholder="Introduce la referencia bibliográfica..."
                value={bibliography.reference}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBibliographyChange(bibliography.id, e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton 
                onClick={() => removeBibliography(bibliography.id)}
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
            onClick={addBibliography}
            variant="outlined"
            sx={{ mt: 1 }}
            disabled={reportLoading}
          >
            Añadir referencia bibliográfica
          </Button>
        </>
      )}
    </Box>
  );
};

export default Bibliography; 