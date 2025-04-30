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
  Divider
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
import SurveyEnableDialog from './Survey/SurveyEnableDialog';
import SurveyDisableDialog from './Survey/SurveyDisableDialog';

const Surveys = () => {
  const { token } = useAuth();
  const { report, updateFullReport } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localReport, setLocalReport] = useState(report);
  const expectedStateRef = useRef<'active' | 'inactive' | null>(null);

  // Estados para la tabla comparativa
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

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
          per_page: 100
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

  useEffect(() => {
    if (report && (expectedStateRef.current === null || report.survey_state === expectedStateRef.current)) {
      console.log('Reporte actualizado en useEffect:', report.survey_state, 'Estado esperado:', expectedStateRef.current);
      setLocalReport(report);
      expectedStateRef.current = null;
    }
  }, [report]);

  const handleActivate = async (scale: number) => {
    if (!token || !report) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Estado antes de activar:', localReport?.survey_state);
      
      expectedStateRef.current = 'active';
      
      const updatedLocalReport = {
        ...report,
        survey_state: 'active' as const,
        scale: scale
      };
      console.log('Nuevo estado local a establecer:', updatedLocalReport.survey_state);
      setLocalReport(updatedLocalReport);

      await reportService.updateReport(report.id, { 
        survey_state: 'active',
        scale: scale
      }, token);
      
      await updateFullReport({
        survey_state: 'active',
        scale: scale
      });
      
      setSuccess('Encuesta activada correctamente');
      setEnableDialogOpen(false);
    } catch (error) {
      expectedStateRef.current = null;
      setLocalReport(report);
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
      
      const updatedLocalReport = {
        ...report,
        survey_state: 'inactive' as const
      };
      setLocalReport(updatedLocalReport);

      await reportService.updateReport(report.id, { 
        survey_state: 'inactive'
      }, token);
      
      await updateFullReport({
        survey_state: 'inactive'
      });
      
      setSuccess('Encuesta desactivada correctamente');
      setDisableDialogOpen(false);
    } catch (error) {
      expectedStateRef.current = null;
      setLocalReport(report);
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
      
      const updatedLocalReport = {
        ...report,
        scale: scale
      };
      setLocalReport(updatedLocalReport);

      await reportService.updateReport(report.id, { 
        scale: scale
      }, token);
      
      await updateFullReport({
        scale: scale
      });
      
      setSuccess('Escala actualizada correctamente');
      setEnableDialogOpen(false);
    } catch (error) {
      setLocalReport(report);
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

  const internalStakeholders = stakeholders.filter(s => s.type === 'internal');
  const externalStakeholders = stakeholders.filter(s => s.type === 'external');

  console.log('Estado actual en el render:', localReport?.survey_state);

  if (!localReport) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Encuestas
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {localReport.survey_state === 'inactive' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenEnableDialog(false)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Activar Encuesta
          </Button>
        ) : (
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
        )}
      </Stack>

      {localReport.survey_state === 'active' && (
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
                    <TableCell>Grupo de Interés</TableCell>
                    {materialTopics.map(topic => (
                      <TableCell key={topic.id} sx={{ maxWidth: 150, fontSize: '0.8rem' }}>
                        {topic.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Grupos de interés internos */}
                  {internalStakeholders.map(stakeholder => (
                    <TableRow key={stakeholder.id}>
                      <TableCell>{stakeholder.name} (Internal)</TableCell>
                      {materialTopics.map(topic => (
                        <TableCell key={topic.id}>
                          {getAssessmentScore(stakeholder.id, topic.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* Línea divisoria */}
                  <TableRow>
                    <TableCell colSpan={materialTopics.length + 1}>
                      <Divider sx={{ my: 1, borderWidth: 2 }} />
                    </TableCell>
                  </TableRow>

                  {/* Grupos de interés externos */}
                  {externalStakeholders.map(stakeholder => (
                    <TableRow key={stakeholder.id}>
                      <TableCell>{stakeholder.name}</TableCell>
                      {materialTopics.map(topic => (
                        <TableCell key={topic.id}>
                          {getAssessmentScore(stakeholder.id, topic.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* Medias */}
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell><strong>Media Interna</strong></TableCell>
                    {materialTopics.map(topic => {
                      const scores = internalStakeholders.map(s => 
                        getAssessmentScore(s.id, topic.id)
                      );
                      return (
                        <TableCell key={topic.id}>
                          {calculateAverage(scores).toFixed(2)}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell><strong>Media Externa</strong></TableCell>
                    {materialTopics.map(topic => {
                      const scores = externalStakeholders.map(s => 
                        getAssessmentScore(s.id, topic.id)
                      );
                      return (
                        <TableCell key={topic.id}>
                          {calculateAverage(scores).toFixed(2)}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  <TableRow sx={{ backgroundColor: 'grey.200' }}>
                    <TableCell><strong>Media Total</strong></TableCell>
                    {materialTopics.map(topic => {
                      const internalScores = internalStakeholders.map(s => 
                        getAssessmentScore(s.id, topic.id)
                      );
                      const externalScores = externalStakeholders.map(s => 
                        getAssessmentScore(s.id, topic.id)
                      );
                      const internalAvg = calculateAverage(internalScores);
                      const externalAvg = calculateAverage(externalScores);
                      const totalAvg = (internalAvg + externalAvg) / 2;
                      return (
                        <TableCell key={topic.id}>
                          {totalAvg.toFixed(2)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <SurveyEnableDialog
        open={enableDialogOpen}
        onClose={handleCloseEnableDialog}
        onConfirm={isEditMode ? handleEdit : handleActivate}
        currentScale={localReport.scale}
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