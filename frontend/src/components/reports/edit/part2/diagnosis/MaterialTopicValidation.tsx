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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, MaterialTopic, PriorityLevel, sortMaterialTopics } from '@/services/materialTopicService';
import { surveyService, Assessment } from '@/services/surveyService';
import { getDimension, getBackgroundColor } from '@/services/odsService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const priorityOptions = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' }
];

const MaterialTopicValidation: React.FC = () => {
  const { token } = useAuth();
  const { report, readOnly } = useReport();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [changes, setChanges] = useState<{ [key: number]: boolean }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTopicForDelete, setSelectedTopicForDelete] = useState<MaterialTopic | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !report) return;
      try {
        setLoading(true);
        setError(null);

        // Cargar asuntos de materialidad
        const topics = await materialTopicService.getAllByReport(report.id, token);
        setMaterialTopics(sortMaterialTopics<MaterialTopic>(topics));

        // Cargar valoraciones
        const assessmentsData = await surveyService.getAllAssessments(report.id, token);
        setAssessments(assessmentsData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, report]);

  const calculateMaterialityPriority = (topicId: number): PriorityLevel => {
    const topicAssessments = assessments.filter(a => a.material_topic_id === topicId);
    if (topicAssessments.length === 0) return 'low';

    const averageScore = topicAssessments.reduce((sum, a) => sum + a.score, 0) / topicAssessments.length;
    const scale = report?.scale || 5;
    const threshold60 = scale * 0.6;
    const threshold80 = scale * 0.8;

    if (averageScore >= threshold80) return 'high';
    if (averageScore >= threshold60) return 'medium';
    return 'low';
  };

  const handlePriorityChange = (topicId: number, newPriority: PriorityLevel) => {
    setMaterialTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === topicId ? { ...topic, priority: newPriority } : topic
      )
    );
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleSaveChanges = async (topicId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const topic = materialTopics.find(t => t.id === topicId);
      if (!topic) return;

      await materialTopicService.updateMaterialTopic(
        topicId,
        { priority: topic.priority },
        token
      );

      setChanges(prev => ({ ...prev, [topicId]: false }));
      setSuccess('Prioridad actualizada correctamente');
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (topic: MaterialTopic) => {
    setSelectedTopicForDelete(topic);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedTopicForDelete) return;
    try {
      setLoading(true);
      setError(null);

      await materialTopicService.deleteMaterialTopic(selectedTopicForDelete.id, token);
      setMaterialTopics(prevTopics => 
        prevTopics.filter(topic => topic.id !== selectedTopicForDelete.id)
      );
      setSuccess('Asunto de materialidad eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar el asunto de materialidad. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedTopicForDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTopicForDelete(null);
  };

  if (loading && materialTopics.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Validación de Asuntos de Materialidad
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dimensión</TableCell>
              <TableCell>Asunto de Materialidad</TableCell>
              <TableCell>Prioridad de Materialidad</TableCell>
              <TableCell>Prioridad de Validación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materialTopics.map((topic) => {
              const materialityPriority = calculateMaterialityPriority(topic.id);
              return (
                <TableRow 
                  key={topic.id}
                  sx={{ 
                    backgroundColor: getBackgroundColor(topic.goal_ods_id ?? undefined),
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light' 
                        ? `${getBackgroundColor(topic.goal_ods_id ?? undefined)}dd`
                        : `${getBackgroundColor(topic.goal_ods_id ?? undefined)}99`
                    }
                  }}
                >
                  <TableCell>{getDimension(topic.goal_ods_id ?? undefined)}</TableCell>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell>
                    {priorityOptions.find(opt => opt.value === materialityPriority)?.label || 'Sin prioridad'}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }} disabled={readOnly}>
                      <InputLabel>Prioridad</InputLabel>
                      <Select
                        value={topic.priority || ''}
                        label="Prioridad"
                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => 
                          handlePriorityChange(topic.id, e.target.value as PriorityLevel)
                        }
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '& .MuiSelect-select': {
                            cursor: readOnly ? 'default' : 'pointer'
                          }
                        }}
                      >
                        {priorityOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {changes[topic.id] && (
                        <Tooltip title="Guardar cambios">
                          <IconButton
                            color="primary"
                            onClick={() => handleSaveChanges(topic.id)}
                            disabled={loading}
                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!readOnly && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(topic)}
                            disabled={loading}
                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el asunto de materialidad "{selectedTopicForDelete?.name}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialTopicValidation; 