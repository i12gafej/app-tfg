import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/context/auth.context';
import { actionPlanService } from '@/services/actionPlanService';
import BarChartIcon from '@mui/icons-material/BarChart';
import { DIMENSION_COLORS } from '@/services/odsService';

const InternalConsistencyGraph = () => {
  const { report } = useReport();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{
    graph_data_url: string;
    dimension_totals: Array<{ dimension: string; total: number }>;
  } | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
    if (!report || !token) return;
    try {
      setLoading(true);
      setError(null);
      const response = await actionPlanService.getInternalConsistencyGraph(report.id, token);
      setGraphData(response);
    } catch (error) {
      console.error('Error al generar la gráfica:', error);
      setError('Error al generar la gráfica');
    } finally {
      setLoading(false);
      }
    };
    fetchGraph();
  }, [report, token]);

  // Función para obtener el color de la dimensión
  const getDimensionColor = (dimension: string): string => {
    switch (dimension.toUpperCase()) {
      case 'PERSONAS':
      case 'PEOPLE':
        return DIMENSION_COLORS.PEOPLE;
      case 'PLANETA':
      case 'PLANET':
        return DIMENSION_COLORS.PLANET;
      case 'PROSPERIDAD':
      case 'PROSPERITY':
        return DIMENSION_COLORS.PROSPERITY;
      case 'PAZ':
      case 'PEACE':
        return DIMENSION_COLORS.PEACE;
      case 'ALIANZAS':
      case 'PARTNERSHIP':
        return DIMENSION_COLORS.PARTNERSHIP;
      default:
        return 'transparent';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gráfico de Coherencia Interna
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
      <Box sx={{ mb: 3 }}>
          <CircularProgress />
      </Box>
      )}

      {graphData && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box
              component="img"
              src={graphData.graph_data_url}
              alt="Gráfico de coherencia interna"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '600px',
                objectFit: 'contain'
              }}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Impactos totales por dimensión
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dimensión</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {graphData.dimension_totals.map((item) => (
                    <TableRow key={item.dimension}>
                      <TableCell>
                        <Box component="span" sx={{
                          display: 'inline-block',
                          width: 18,
                          height: 18,
                          borderRadius: '4px',
                          backgroundColor: getDimensionColor(item.dimension),
                          verticalAlign: 'middle',
                          mr: 1,
                          border: '1px solid #bbb'
                        }} />
                        {item.dimension}
                      </TableCell>
                      <TableCell align="right">{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default InternalConsistencyGraph; 
 