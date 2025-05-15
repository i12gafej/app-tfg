import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Stack,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '@/context/ReportContext';
import { reportService } from '@/services/reportServices';
import { materialTopicService, MaterialTopic } from '@/services/materialTopicService';
import { stakeholderService, Stakeholder } from '@/services/stakeholderService';
import { surveyService, Assessment } from '@/services/surveyService';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CompareIcon from '@mui/icons-material/Compare';
import SurveyEnableDialog from './Survey/SurveyEnableDialog';
import SurveyDisableDialog from './Survey/SurveyDisableDialog';

const Surveys = () => {
  const { token } = useAuth();
  const { report, updateFullReport, readOnly } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const expectedStateRef = useRef<'active' | 'inactive' | null>(null);

  // Estados para la tabla comparativa
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedStakeholders, setSelectedStakeholders] = useState<number[]>([]);

  // Efecto para cargar los datos de la tabla cuando el reporte está activo
  useEffect(() => {
    const loadTableData = async () => {
      if (!token || !report || report.survey_state !== 'active') return;

      try {
        setTableLoading(true);
        setError(null);

        // Cargar asuntos relevantes
        const topics = await materialTopicService.getAllByReport(report.id, token);
        setMaterialTopics(topics);

        // Cargar grupos de interés
        const stakeholdersResponse = await stakeholderService.searchStakeholders({
          report_id: report.id,
        }, token);
        setStakeholders(stakeholdersResponse.items);

        // Cargar valoraciones
        const assessmentsData = await surveyService.getAllAssessments(report.id, token);
        setAssessments(assessmentsData);
      } catch (err) {
        console.error('Error al cargar datos de la tabla:', err);
        setError('Error al cargar los datos de la tabla. Por favor, inténtalo de nuevo.');
      } finally {
        setTableLoading(false);
      }
    };

    loadTableData();
  }, [token, report]);

  const handleActivate = async (scale: number) => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);
      expectedStateRef.current = 'active';
      const updatedReport = await reportService.updateReport(
        report.id,
        { 
          survey_state: 'active',
          scale: scale
        },
        token
      );
      console.log('Respuesta del backend (updateReport):', updatedReport);
      await updateFullReport({
        survey_state: 'active',
        scale: scale
      });
      setSuccess('Encuesta activada correctamente');
      setEnableDialogOpen(false);
    } catch (error) {
      expectedStateRef.current = null;
      console.error('Error al activar la encuesta:', error);
      setError('Error al activar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleInactivate = async () => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);
      expectedStateRef.current = 'inactive';
      const updatedReport = await reportService.updateReport(
        report.id,
        { 
          survey_state: 'inactive'
        },
        token
      );
      console.log('Respuesta del backend (updateReport):', updatedReport);
      await updateFullReport({
        survey_state: 'inactive'
      });
      setSuccess('Encuesta desactivada correctamente');
      setDisableDialogOpen(false);
    } catch (error) {
      expectedStateRef.current = null;
      console.error('Error al desactivar la encuesta:', error);
      setError('Error al desactivar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (scale: number) => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);

      // Solo una llamada, y siempre con el estado actual
      const updatedReport = await updateFullReport({
        scale: scale,
        survey_state: report.survey_state
      });
      console.log('Respuesta del backend (updateReport):', updatedReport);

      setSuccess('Escala actualizada correctamente');
      setEnableDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar la escala:', error);
      setError('Error al actualizar la escala');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnableDialog = (edit: boolean = false) => {
    setIsEditMode(edit);
    setEnableDialogOpen(true);
  };

  const handleCloseEnableDialog = () => {
    setEnableDialogOpen(false);
    setIsEditMode(false);
  };

  const handleCloseDisableDialog = () => {
    setDisableDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };

  const getAssessmentScore = (stakeholderId: number, materialTopicId: number): number | null => {
    const assessment = assessments.find(
      a => a.stakeholder_id === stakeholderId && a.material_topic_id === materialTopicId
    );
    return assessment ? assessment.score : null;
  };

  const calculateAverage = (scores: (number | null)[]): number => {
    const validScores = scores.filter((score): score is number => score !== null);
    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  };

  const calculateStandardDeviation = (scores: (number | null)[]): number => {
    const validScores = scores.filter((score): score is number => score !== null);
    if (validScores.length === 0) return 0;
    const mean = calculateAverage(validScores);
    const squareDiffs = validScores.map(score => Math.pow(score - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / validScores.length;
    return Math.sqrt(avgSquareDiff);
  };

  const calculateCoefficientOfVariation = (scores: (number | null)[]): number => {
    const mean = calculateAverage(scores);
    if (mean === 0) return 0;
    const stdDev = calculateStandardDeviation(scores);
    return (stdDev / mean) * 100; // Retorna como porcentaje
  };

  const calculateValuationBias = (scores: (number | null)[], scale: number): number => {
    const mean = calculateAverage(scores);
    const theoreticalMean = (scale + 1) / 2; // Punto medio de la escala
    return ((mean - theoreticalMean) / theoreticalMean) * 100; // Retorna como porcentaje
  };

  const getValuationStatus = (cv: number, bias: number): { status: string; color: string } => {
    if (cv > 50) {
      return { status: 'Alta dispersión', color: '#f44336' }; // Rojo
    } else if (cv > 30) {
      return { status: 'Dispersión moderada', color: '#ff9800' }; // Naranja
    } else if (Math.abs(bias) > 30) {
      return { status: 'Sesgo significativo', color: '#ff9800' }; // Naranja
    } else {
      return { status: 'Normalizado', color: '#4caf50' }; // Verde
    }
  };

  const internalStakeholders = stakeholders.filter(s => s.type === 'internal');
  const externalStakeholders = stakeholders.filter(s => s.type === 'external');

  console.log('Estado actual en el render:', report?.survey_state);

  const handleOpenCompareDialog = () => {
    setSelectedStakeholders(stakeholders.map(s => s.id));
    setCompareDialogOpen(true);
  };

  const handleCloseCompareDialog = () => {
    setCompareDialogOpen(false);
  };

  const handleStakeholderSelection = (event: any) => {
    const value = event.target.value;
    if (value.includes('all')) {
      // Si se selecciona "Todos", seleccionar todos los stakeholders
      setSelectedStakeholders(stakeholders.map(s => s.id));
    } else if (value.includes('none')) {
      // Si se selecciona "Ninguno", deseleccionar todos
      setSelectedStakeholders([]);
    } else {
      // Si se seleccionan stakeholders individuales
      setSelectedStakeholders(value);
    }
  };

  if (!report) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Encuestas
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {!readOnly && report.survey_state === 'inactive' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenEnableDialog(false)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Activar Encuesta
          </Button>
        ) : !readOnly && report.survey_state === 'active' ? (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={() => setDisableDialogOpen(true)}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <StopIcon />}
            >
              Desactivar Encuesta
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenEnableDialog(true)}
              disabled={loading}
              startIcon={<EditIcon />}
            >
              Editar Encuesta
            </Button>
          </>
        ) : null}
      </Stack>

      {report.survey_state === 'active' && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Tabla Comparativa de Valoraciones
          </Typography>

          {tableLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asunto Relevante</TableCell>
                    <TableCell align="center">Media Interna</TableCell>
                    <TableCell align="center">Media Externa</TableCell>
                    <TableCell align="center">Media Total</TableCell>
                    <TableCell align="center">Dispersión (CV%)</TableCell>
                    <TableCell align="center">Sesgo (%)</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center" width="100px">
                      <Tooltip title="Comparar votaciones">
                        <IconButton onClick={handleOpenCompareDialog} size="small">
                          <CompareIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialTopics.map(topic => {
                    const internalScores = internalStakeholders.map(s => 
                      getAssessmentScore(s.id, topic.id)
                    );
                    const externalScores = externalStakeholders.map(s => 
                      getAssessmentScore(s.id, topic.id)
                    );
                    const allScores = [...internalScores, ...externalScores];
                    const internalAvg = calculateAverage(internalScores);
                    const externalAvg = calculateAverage(externalScores);
                    const totalAvg = (internalAvg + externalAvg) / 2;
                    const cv = calculateCoefficientOfVariation(allScores);
                    const bias = calculateValuationBias(allScores, report.scale);
                    const { status, color } = getValuationStatus(cv, bias);

                    return (
                      <TableRow key={topic.id}>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topic.name}
                        </TableCell>
                        <TableCell align="center">{internalAvg.toFixed(2)}</TableCell>
                        <TableCell align="center">{externalAvg.toFixed(2)}</TableCell>
                        <TableCell align="center">{totalAvg.toFixed(2)}</TableCell>
                        <TableCell align="center">{cv.toFixed(1)}%</TableCell>
                        <TableCell align="center">{bias.toFixed(1)}%</TableCell>
                        <TableCell align="center" sx={{ color }}>
                          {status}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Diálogo de comparación */}
      <Dialog
        open={compareDialogOpen}
        onClose={handleCloseCompareDialog}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Comparación de Votaciones</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Grupos de Interés</InputLabel>
              <Select
                multiple
                value={selectedStakeholders}
                onChange={handleStakeholderSelection}
                label="Grupos de Interés"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        '&.Mui-selected': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1976d2',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="none">Ninguno</MenuItem>
                {stakeholders.map(stakeholder => (
                  <MenuItem key={stakeholder.id} value={stakeholder.id}>
                    {stakeholder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Asunto Relevante</TableCell>
                  {stakeholders
                    .filter(s => selectedStakeholders.includes(s.id))
                    .map(stakeholder => (
                      <TableCell 
                        key={stakeholder.id} 
                        align="center" 
                        sx={{ 
                          maxWidth: 150, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontWeight: 'bold'
                        }}
                      >
                        {stakeholder.name}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {materialTopics.map(topic => (
                  <TableRow key={topic.id}>
                    <TableCell 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold'
                      }}
                    >
                      {topic.name}
                    </TableCell>
                    {stakeholders
                      .filter(s => selectedStakeholders.includes(s.id))
                      .map(stakeholder => (
                        <TableCell key={stakeholder.id} align="center">
                          {getAssessmentScore(stakeholder.id, topic.id)?.toFixed(2) || '-'}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <SurveyEnableDialog
        open={enableDialogOpen}
        onClose={handleCloseEnableDialog}
        onConfirm={isEditMode ? handleEdit : handleActivate}
        currentScale={report.scale}
        isEdit={isEditMode}
      />

      <SurveyDisableDialog
        open={disableDialogOpen}
        onClose={handleCloseDisableDialog}
        onConfirm={handleInactivate}
      />

      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Surveys; 