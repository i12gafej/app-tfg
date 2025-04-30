import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '@/context/ReportContext';
import { graphsService } from '@/services/graphsService';

const Graphs = () => {
  const { token } = useAuth();
  const { report } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainImpactsGraph, setMainImpactsGraph] = useState<string | null>(null);
  const [secondaryImpactsGraph, setSecondaryImpactsGraph] = useState<string | null>(null);

  const handleGenerateGraphs = async () => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);

      // Obtener ambas gráficas en paralelo
      const [mainResponse, secondaryResponse] = await Promise.all([
        graphsService.getMainImpactsGraph(report.id, token),
        graphsService.getSecondaryImpactsGraph(report.id, token)
      ]);

      setMainImpactsGraph(mainResponse.graph_data_url);
      setSecondaryImpactsGraph(secondaryResponse.graph_data_url);
    } catch (error) {
      console.error('Error al generar gráficas:', error);
      setError('Error al generar las gráficas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gráficas de Impactos
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleGenerateGraphs}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Generando gráficas...
            </>
          ) : (
            'Generar Gráficas'
          )}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Impactos Principales
              </Typography>
              {mainImpactsGraph ? (
                <Box
                  component="img"
                  src={mainImpactsGraph}
                  alt="Gráfica de Impactos Principales"
                  sx={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay gráfica generada
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Impactos Secundarios
              </Typography>
              {secondaryImpactsGraph ? (
                <Box
                  component="img"
                  src={secondaryImpactsGraph}
                  alt="Gráfica de Impactos Secundarios"
                  sx={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay gráfica generada
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Graphs; 