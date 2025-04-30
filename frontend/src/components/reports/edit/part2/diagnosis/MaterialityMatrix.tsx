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
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, MaterialityMatrixResponse } from '@/services/materialTopicService';

const MaterialityMatrix = () => {
  const { token } = useAuth();
  const { report } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<MaterialityMatrixResponse | null>(null);

  const handleGenerateMatrix = async () => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);
      const response = await materialTopicService.getMaterialityMatrix(report.id, token);
      setMatrixData(response);
    } catch (error) {
      console.error('Error al generar matriz de materialidad:', error);
      setError('Error al generar la matriz de materialidad. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Matriz de Materialidad
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleGenerateMatrix}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Generando matriz...
            </>
          ) : (
            'Generar Matriz'
          )}
        </Button>

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
                  sx={{ width: '100%', height: 'auto' }}
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
              {matrixData?.matrix_data ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.75rem' }}>ID</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>Asunto</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>Dimensión</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(matrixData.matrix_data.topic_names).map(([id, name]) => (
                        <TableRow key={id}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{id}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{name}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: matrixData.matrix_data.dimension_colors[matrixData.matrix_data.dimensions[Number(id)]],
                                display: 'inline-block',
                                mr: 1
                              }}
                            />
                            {matrixData.matrix_data.dimensions[Number(id)]}
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