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
import { useReport } from '@/context/ReportContext';
import { reportService, ReportAgreement } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';

interface PendingChange {
  type: 'create' | 'update' | 'delete';
  agreement: ReportAgreement;
  originalAgreement?: ReportAgreement;
}

const Agreements = () => {
  const { report, loading: reportLoading } = useReport();
  const { token } = useAuth();
  const [agreements, setAgreements] = useState<ReportAgreement[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar acuerdos iniciales
  useEffect(() => {
    const loadAgreements = async () => {
      if (!report?.id || !token) return;
      
      try {
        const agreements = await reportService.getReportAgreements(report.id, token);
        setAgreements(agreements);
      } catch (err) {
        console.error('Error al cargar los acuerdos:', err);
        setError('Error al cargar los acuerdos. Por favor, recarga la página.');
      }
    };

    loadAgreements();
  }, [report?.id, token]);

  const addAgreement = () => {
    const newAgreement: ReportAgreement = {
      id: Date.now(), // ID temporal para cambios pendientes
      agreement: '',
      report_id: report?.id || 0
    };
    
    setAgreements([...agreements, newAgreement]);
    setPendingChanges([...pendingChanges, { type: 'create', agreement: newAgreement }]);
  };

  const removeAgreement = (id: number) => {
    const agreementToRemove = agreements.find(a => a.id === id);
    if (!agreementToRemove) return;

    setAgreements(agreements.filter(a => a.id !== id));
    
    // Si es un acuerdo nuevo (creado en esta sesión), lo eliminamos de los cambios pendientes
    if (id > 1000000) { // IDs temporales son grandes
      setPendingChanges(pendingChanges.filter(change => change.agreement.id !== id));
    } else {
      // Si es un acuerdo existente, lo marcamos para eliminación
      setPendingChanges([...pendingChanges, { type: 'delete', agreement: agreementToRemove }]);
    }
  };

  const handleAgreementChange = (id: number, newText: string) => {
    const agreementToUpdate = agreements.find(a => a.id === id);
    if (!agreementToUpdate) return;

    const updatedAgreement = { ...agreementToUpdate, agreement: newText };
    setAgreements(agreements.map(a => a.id === id ? updatedAgreement : a));

    // Si es un acuerdo nuevo, actualizamos el cambio pendiente de creación
    if (id > 1000000) {
      setPendingChanges(pendingChanges.map(change => 
        change.agreement.id === id ? { ...change, agreement: updatedAgreement } : change
      ));
    } else {
      // Si es un acuerdo existente, lo marcamos para actualización
      const existingChange = pendingChanges.find(change => 
        change.type === 'update' && change.agreement.id === id
      );

      if (existingChange) {
        setPendingChanges(pendingChanges.map(change => 
          change.agreement.id === id ? { ...change, agreement: updatedAgreement } : change
        ));
      } else {
        setPendingChanges([...pendingChanges, { 
          type: 'update', 
          agreement: updatedAgreement,
          originalAgreement: agreementToUpdate
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
      // Filtrar acuerdos vacíos
      const validChanges = pendingChanges.filter(change => {
        const agreementText = change.agreement.agreement.trim();
        return agreementText.length > 0;
      });

      if (validChanges.length === 0) {
        setError('No hay cambios válidos para guardar. Los acuerdos no pueden estar vacíos.');
        setIsSaving(false);
        return;
      }

      // Procesar cambios en orden: primero eliminaciones, luego actualizaciones, finalmente creaciones
      const deletions = validChanges.filter(change => change.type === 'delete');
      const updates = validChanges.filter(change => change.type === 'update');
      const creations = validChanges.filter(change => change.type === 'create');

      // Ejecutar eliminaciones
      for (const change of deletions) {
        await reportService.deleteAgreement(change.agreement.id, token);
      }

      // Ejecutar actualizaciones
      for (const change of updates) {
        await reportService.updateAgreement(
          report.id, 
          change.agreement.id, 
          change.agreement.agreement, 
          token
        );
      }

      // Ejecutar creaciones
      for (const change of creations) {
        await reportService.createAgreement(
          report.id, 
          change.agreement.agreement, 
          token
        );
      }

      // Obtener los acuerdos actualizados
      const updatedAgreements = await reportService.getReportAgreements(report.id, token);
      setAgreements(updatedAgreements);

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
          Acuerdos
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
      
      {agreements.map((agreement) => (
        <Paper 
          key={agreement.id}
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
            placeholder="Introduce el acuerdo..."
            value={agreement.agreement}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAgreementChange(agreement.id, e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton 
            onClick={() => removeAgreement(agreement.id)}
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
        onClick={addAgreement}
        variant="outlined"
        sx={{ mt: 1 }}
        disabled={reportLoading}
      >
        Añadir acuerdo
      </Button>
    </Box>
  );
};

export default Agreements; 