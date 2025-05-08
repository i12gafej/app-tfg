import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
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

      // Obtener las gráficos secuencialmente
      const mainResponse = await graphsService.getMainImpactsGraph(report.id, token);
      setMainImpactsGraph(mainResponse.graph_data_url);

      const secondaryResponse = await graphsService.getSecondaryImpactsGraph(report.id, token);
      setSecondaryImpactsGraph(secondaryResponse.graph_data_url);
    } catch (error) {
      console.error('Error al generar gráficos:', error);
      setError('Error al generar las gráficos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Generar gráficas automáticamente al cargar el componente
  useEffect(() => {
    if (token && report) {
      handleGenerateGraphs();
    }
  }, [token, report]);

  const handleDownload = (imageUrl: string, filename: string) => {
    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gráficos de Impactos ODS
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
              Generando gráficos...
            </>
          ) : (
            'Regenerar Gráficos'
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Impactos Principales ODS
                </Typography>
                {mainImpactsGraph && (
                  <Tooltip title="Descargar gráfico">
                    <IconButton 
                      onClick={() => handleDownload(mainImpactsGraph, 'impactos_principales_ods.png')}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              {mainImpactsGraph ? (
                <Box
                  component="img"
                  src={mainImpactsGraph}
                  alt="Gráfico de Impactos Principales ODS"
                  sx={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay gráfico generado
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Impactos Secundarios ODS
                </Typography>
                {secondaryImpactsGraph && (
                  <Tooltip title="Descargar gráfico">
                    <IconButton 
                      onClick={() => handleDownload(secondaryImpactsGraph, 'impactos_secundarios_ods.png')}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              {secondaryImpactsGraph ? (
                <Box
                  component="img"
                  src={secondaryImpactsGraph}
                  alt="Gráfico de Impactos Secundarios ODS"
                  sx={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay gráfico generado
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