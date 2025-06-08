import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/context/auth.context';
import { monitoringService } from '@/services/monitoringServices';

const MonitoringTemplates = () => {
  const { report } = useReport();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTemplate = async () => {
    if (!report?.id || !token) return;

    try {
      setLoading(true);
      setError(null);
      const blob = await monitoringService.getMonitoringTemplate(report.id, token);
      
      
      const url = window.URL.createObjectURL(blob);
      
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_seguimiento.docx';
      
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar la plantilla:', error);
      setError('Error al generar la plantilla de seguimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Plantilla de seguimiento
      </Typography>
      
      <Typography paragraph>
        Plantillas para el seguimiento y control de las acciones del plan de sostenibilidad.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleGenerateTemplate}
          disabled={loading || !report?.id}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Generando...' : 'Generar Plantilla de Seguimiento'}
        </Button>
      </Box>
    </Box>
  );
};

export default MonitoringTemplates; 