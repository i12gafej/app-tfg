import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useAuth } from '@/context/auth.context';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, MaterialityMatrixResponse } from '@/services/materialTopicService';
import DownloadIcon from '@mui/icons-material/Download';

type MaterialityMatrixDataWithLegend = MaterialityMatrixResponse & {
  matrix_data: {
    leyenda_order?: number[];
    legend_numbers?: Record<number, number>;
    [key: string]: any;
  };
};

const MaterialityMatrix = () => {
  const { token } = useAuth();
  const { report } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<MaterialityMatrixDataWithLegend | null>(null);

  const handleGenerateMatrix = async (normalize = false) => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);
      const response = await materialTopicService.getMaterialityMatrix(report.id, token, normalize, report.scale);
      setMatrixData(response);
    } catch (error) {
      console.error('Error al generar matriz de materialidad:', error);
      setError('Error al generar la matriz de materialidad. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMatrix = () => {
    if (!matrixData?.matrix_image) return;
    const link = document.createElement('a');
    link.href = matrixData.matrix_image;
    link.download = 'matriz_materialidad.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generar matriz automáticamente al cargar el componente
  useEffect(() => {
    if (token && report) {
      handleGenerateMatrix();
    }
  }, [token, report]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Matriz de Materialidad
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => handleGenerateMatrix(false)}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Generando matriz...
              </>
            ) : (
              'Regenerar Matriz'
            )}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleGenerateMatrix(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Generando matriz...
              </>
            ) : (
              'Generar Matriz Normalizada'
            )}
          </Button>
          {matrixData?.matrix_image && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadMatrix}
            >
              Descargar Matriz
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Matriz de Materialidad
              </Typography>
              {matrixData?.matrix_image ? (
                <Box
                  component="img"
                  src={matrixData.matrix_image}
                  alt="Matriz de Materialidad"
                  sx={{ width: '100%', maxWidth: 500, height: 'auto', display: 'block', margin: '0 auto' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay matriz generada
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Leyenda
              </Typography>
              {matrixData?.matrix_data && matrixData.matrix_data.leyenda_order && matrixData.matrix_data.legend_numbers ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.75rem' }}>Nº</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>Asunto</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>Dimensión</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {matrixData.matrix_data.leyenda_order.map((id: number) => (
                        <TableRow
                          key={id}
                          sx={{
                            backgroundColor: matrixData.matrix_data.dimension_colors[matrixData.matrix_data.dimensions[id]],
                            '& td': { backgroundColor: 'inherit' }
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.75rem' }}>{matrixData.matrix_data.legend_numbers![id]}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{matrixData.matrix_data.topic_names[id]}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {matrixData.matrix_data.dimensions[id]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay datos disponibles
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MaterialityMatrix; 