import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/hooks/useAuth';
import { actionPlanService } from '@/services/actionPlanService';
import { odsService } from '@/services/odsService';
import type { ActionPrimaryImpact } from '@/services/actionPlanService';
import type { ActionSecondaryImpactCount } from '@/services/odsService';

type Dimension = 'Personas' | 'Planeta' | 'Prosperidad' | 'Paz' | 'Alianzas';

interface ODSImpact {
  dimension: Dimension;
  ods_id: number;
  ods_name: string;
  primary_impacts: number;
  weighted_primary_impacts: number;
  secondary_impacts: number;
  weighted_secondary_impacts: number;
  total_value: number;
}

// Definir los colores por dimensión
const DIMENSION_COLORS: { [key in Dimension]: string } = {
  'Personas': '#D3DDF2',
  'Planeta': '#C1DDB0',
  'Prosperidad': '#F9E4C7',
  'Paz': '#C6E6F5',
  'Alianzas': '#DCCAE4'
};

// Mapeo de ODS a dimensiones
const ODS_DIMENSIONS: { [key: number]: Dimension } = {
  1: 'Personas', 2: 'Personas', 3: 'Personas', 4: 'Personas', 5: 'Personas',
  6: 'Planeta', 12: 'Planeta', 13: 'Planeta', 14: 'Planeta', 15: 'Planeta',
  7: 'Prosperidad', 8: 'Prosperidad', 9: 'Prosperidad', 10: 'Prosperidad', 11: 'Prosperidad',
  16: 'Paz',
  17: 'Alianzas'
};

const InternalConsistency = () => {
  const { report, updateReport, readOnly } = useReport();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImpacts, setPrimaryImpacts] = useState<ActionPrimaryImpact[]>([]);
  const [secondaryImpacts, setSecondaryImpacts] = useState<ActionSecondaryImpactCount[]>([]);
  const [mainWeight, setMainWeight] = useState(report?.main_impact_weight || 3);
  const [secondaryWeight, setSecondaryWeight] = useState(report?.secondary_impact_weight || 1);

  // Cargar impactos
  useEffect(() => {
    const fetchImpacts = async () => {
      if (!report || !token) return;
      try {
        setLoading(true);
        const [primary, secondary] = await Promise.all([
          actionPlanService.getAllActionPrimaryImpacts(report.id, token),
          odsService.getAllActionSecondaryImpacts(report.id, token)
        ]);
        setPrimaryImpacts(primary);
        setSecondaryImpacts(secondary);
      } catch (error) {
        console.error('Error al cargar impactos:', error);
        setError('Error al cargar los impactos');
      } finally {
        setLoading(false);
      }
    };

    fetchImpacts();
  }, [report, token]);

  // Procesar datos para la tabla
  const processedData: ODSImpact[] = Array.from({ length: 17 }, (_, i) => i + 1).map(odsId => {
    const primaryImpact = primaryImpacts.find(impact => impact.ods_id === odsId);
    const secondaryImpact = secondaryImpacts.find(impact => impact.ods_id === odsId);
    const primaryCount = primaryImpact?.count || 0;
    const secondaryCount = secondaryImpact?.count || 0;

    return {
      dimension: ODS_DIMENSIONS[odsId],
      ods_id: odsId,
      ods_name: `ODS ${odsId} ${primaryImpact?.ods_name || secondaryImpact?.ods_name || ''}`,
      primary_impacts: primaryCount,
      weighted_primary_impacts: primaryCount * mainWeight,
      secondary_impacts: secondaryCount,
      weighted_secondary_impacts: secondaryCount * secondaryWeight,
      total_value: (primaryCount * mainWeight) + (secondaryCount * secondaryWeight)
    };
  });

  // Calcular totales
  const totals = processedData.reduce((acc, curr) => ({
    primary_impacts: acc.primary_impacts + curr.primary_impacts,
    weighted_primary_impacts: acc.weighted_primary_impacts + curr.weighted_primary_impacts,
    secondary_impacts: acc.secondary_impacts + curr.secondary_impacts,
    weighted_secondary_impacts: acc.weighted_secondary_impacts + curr.weighted_secondary_impacts,
    total_value: acc.total_value + curr.total_value
  }), {
    primary_impacts: 0,
    weighted_primary_impacts: 0,
    secondary_impacts: 0,
    weighted_secondary_impacts: 0,
    total_value: 0
  });

  // Calcular totales por dimensión
  const dimensionTotals = processedData.reduce((acc, curr) => {
    if (!acc[curr.dimension]) {
      acc[curr.dimension] = 0;
    }
    acc[curr.dimension] += curr.total_value;
    return acc;
  }, {} as { [key in Dimension]: number });

  const handleSaveWeights = async () => {
    if (!report) return;
    try {
      setLoading(true);
      await updateReport('main_impact_weight', mainWeight);
      await updateReport('secondary_impact_weight', secondaryWeight);
    } catch (error) {
      console.error('Error al guardar ponderaciones:', error);
      setError('Error al guardar las ponderaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Coherencia Interna
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <TableContainer component={Paper}>
            <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1, px: 1, fontSize: '0.75rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>DIMENSIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>ODS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '12%' }}>Nº IMPACTOS ODS PRINCIPAL</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '12%' }}>VALOR PONDERADO X{mainWeight}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '12%' }}>Nº IMPACTOS ODS SECUNDARIO</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '12%' }}>VALOR PONDERADO X{secondaryWeight}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>VALOR TOTAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedData.map((row) => (
                  <TableRow
                    key={row.ods_id}
                    sx={{ 
                      backgroundColor: DIMENSION_COLORS[row.dimension],
                      '& .MuiTableCell-root': { fontSize: '0.875rem' }
                    }}
                  >
                    <TableCell>{row.dimension}</TableCell>
                    <TableCell>{row.ods_name}</TableCell>
                    <TableCell align="center">{row.primary_impacts}</TableCell>
                    <TableCell align="center">{row.weighted_primary_impacts}</TableCell>
                    <TableCell align="center">{row.secondary_impacts}</TableCell>
                    <TableCell align="center">{row.weighted_secondary_impacts}</TableCell>
                    <TableCell align="center">{row.total_value}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ 
                  '& .MuiTableCell-root': { 
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    backgroundColor: '#f5f5f5'
                  }
                }}>
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell align="center">{totals.primary_impacts}</TableCell>
                  <TableCell align="center">{totals.weighted_primary_impacts}</TableCell>
                  <TableCell align="center">{totals.secondary_impacts}</TableCell>
                  <TableCell align="center">{totals.weighted_secondary_impacts}</TableCell>
                  <TableCell align="center">{totals.total_value}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ponderaciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                label="Ponderación Impacto Principal"
                type="number"
                value={mainWeight}
                onChange={readOnly ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => setMainWeight(Number(e.target.value))}
                inputProps={{ min: 0, step: 1 }}
                size="small"
                fullWidth
                disabled={readOnly}
              />
              <TextField
                label="Ponderación Impacto Secundario"
                type="number"
                value={secondaryWeight}
                onChange={readOnly ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => setSecondaryWeight(Number(e.target.value))}
                inputProps={{ min: 0, step: 1 }}
                size="small"
                fullWidth
                disabled={readOnly}
              />
              {!readOnly && (
                <Button
                  variant="contained"
                  onClick={handleSaveWeights}
                  disabled={loading}
                  size="small"
                  fullWidth
                >
                  Guardar Ponderaciones
                </Button>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recuento por Dimensión
            </Typography>
            <TableContainer>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.75, px: 1, fontSize: '0.75rem' } }}>
                <TableBody>
                  {(Object.keys(DIMENSION_COLORS) as Dimension[]).map((dimension) => (
                    <TableRow 
                      key={dimension}
                      sx={{ 
                        backgroundColor: DIMENSION_COLORS[dimension],
                        '&:last-child td': { border: 0 }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'medium' }}>{dimension}</TableCell>
                      <TableCell align="right">{dimensionTotals[dimension]}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ 
                    '& .MuiTableCell-root': { 
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <TableCell>TOTAL</TableCell>
                    <TableCell align="right">{totals.total_value}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
 
export default InternalConsistency; 