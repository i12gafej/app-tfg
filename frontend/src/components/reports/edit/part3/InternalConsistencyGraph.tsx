import React, { useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { actionPlanService } from '@/services/actionPlanService';
import BarChartIcon from '@mui/icons-material/BarChart';

const InternalConsistencyGraph = () => {
  const { report } = useReport();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{
    graph_data_url: string;
    dimension_totals: Array<{ dimension: string; total: number }>;
  } | null>(null);

  const handleGenerateGraph = async () => {
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

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleGenerateGraph}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <BarChartIcon />}
        >
          Generar Gráfica
        </Button>
      </Box>

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
              Totales por Dimensión
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
                      <TableCell>{item.dimension}</TableCell>
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
 