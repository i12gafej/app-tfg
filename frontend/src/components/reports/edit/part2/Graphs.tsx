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
import { useAuth } from '@/context/auth.context';
import { useReport } from '@/context/ReportContext';
import { graphsService } from '@/services/graphsService';
import { odsService, getODSColor, ODS } from '@/services/odsService';

const Graphs = () => {
  const { token } = useAuth();
  const { report } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainImpactsGraph, setMainImpactsGraph] = useState<string | null>(null);
  const [secondaryImpactsGraph, setSecondaryImpactsGraph] = useState<string | null>(null);
  const [odsList, setOdsList] = useState<ODS[]>([]);

  const handleGenerateGraphs = async () => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);

      
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

  
  useEffect(() => {
    const fetchODS = async () => {
      if (!token) return;
      try {
        const data = await odsService.getAllODS(token);
        setOdsList(data.items);
      } catch (e) {
        
      }
    };
    fetchODS();
  }, [token]);

  
  useEffect(() => {
    if (token && report) {
      handleGenerateGraphs();
    }
  }, [token, report]);

  const handleDownload = (imageUrl: string, filename: string) => {
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const ODSLegend = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 2,
        background: '#eaf3d2',
        borderRadius: 2,
        p: 2,
        mb: 3,
        alignItems: 'center',
        justifyItems: 'center'
      }}
    >
      {odsList.map(ods => (
        <Tooltip
          key={ods.id}
          title={`ODS ${ods.id}: ${ods.name}`}
          arrow
          placement="top"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              minWidth: 90,
              maxWidth: 130,
              p: 0.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 2,
                  background: getODSColor(ods.id),
                  mr: 1,
                  border: '1px solid #888',
                  flexShrink: 0
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ODS {ods.id}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#222',
                fontSize: '0.85em',
                whiteSpace: 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 110
              }}
            >
              {ods.name}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );

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
      {/* Leyenda de ODS */}
      <ODSLegend />
    </Box>
  );
};

export default Graphs; 