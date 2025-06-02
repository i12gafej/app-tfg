import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, sortMaterialTopics } from '@/services/materialTopicService';
import { actionPlanService } from '@/services/actionPlanService';
import { useAuth } from '@/context/auth.context';
import { getBackgroundColor } from '@/services/odsService';
import Autocomplete from '@mui/material/Autocomplete';

interface MaterialTopic {
  id: number;
  name: string;
}

interface SpecificObjective {
  id: number;
  description: string;
  responsible?: string;
  material_topic_id: number;
}

const AssignResponsibles = () => {
  const { report, readOnly } = useReport();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);
  const [objectives, setObjectives] = useState<SpecificObjective[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<SpecificObjective | null>(null);
  const [responsible, setResponsible] = useState('');
  const [responsibles, setResponsibles] = useState<string[]>([]);
  const [selectedResponsible, setSelectedResponsible] = useState<string>('');

  // Cargar asuntos relevantes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !report?.id) return;
      try {
        setLoading(true);
        const topics = await materialTopicService.getAllByReport(report.id, token);
        setMaterialTopics(sortMaterialTopics(topics));
      } catch (error) {
        console.error('Error al cargar asuntos de materialidad:', error);
        setError('Error al cargar los asuntos de materialidad');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, report]);

  // Cargar responsables al montar el componente
  useEffect(() => {
    const fetchResponsibles = async () => {
      if (!token || !report?.id) return;
      try {
        const resps = await actionPlanService.getAllResponsibles(report.id, token);
        setResponsibles(resps);
      } catch (error) {
        setError('Error al cargar responsables');
      }
    };
    fetchResponsibles();
  }, [token, report]);

  // Cargar objetivos específicos cuando se selecciona un asunto de materialidad
  const loadObjectives = async (topicId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      const objectives = await actionPlanService.getSpecificObjectives(topicId, token);
      setObjectives(objectives);
    } catch (error) {
      console.error('Error al cargar objetivos específicos:', error);
      setError('Error al cargar los objetivos específicos');
    } finally {
      setLoading(false);
    }
  };

  // Manejar la selección de un asunto de materialidad
  const handleTopicSelect = (topic: MaterialTopic) => {
    setSelectedTopic(topic);
    loadObjectives(topic.id);
  };

  // Abrir diálogo para asignar responsable
  const handleOpenDialog = (objective: SpecificObjective) => {
    setSelectedObjective(objective);
    setResponsible(objective.responsible || '');
    setSelectedResponsible(objective.responsible || '');
    setDialogOpen(true);
  };

  // Guardar responsable
  const handleSaveResponsible = async () => {
    if (!selectedObjective || !token) return;
    try {
      setLoading(true);
      // Preferencia: si hay texto en el campo, ese es el responsable
      const finalResponsible = responsible.trim() !== '' ? responsible : selectedResponsible;
      await actionPlanService.updateSpecificObjective(
        selectedObjective.id,
        { responsible: finalResponsible },
        token
      );
      if (selectedTopic) {
        await loadObjectives(selectedTopic.id);
      }
      // Siempre recargar responsables después de guardar
      const resps = await actionPlanService.getAllResponsibles(report!.id, token);
      setResponsibles(resps);
      setDialogOpen(false);
    } catch (error) {
      setError('Error al actualizar el responsable');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedTopic) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Asignar responsable a objetivos específicos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Panel de Asuntos de Materialidad */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Asuntos de Materialidad
            </Typography>
            <List sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                },
              },
            }}>
              {materialTopics.map((topic) => (
                <ListItem
                  key={topic.id}
                  button
                  selected={selectedTopic?.id === topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  sx={{
                    backgroundColor: getBackgroundColor((topic as any).goal_ods_id ?? undefined),
                    '&.Mui-selected': {
                      backgroundColor: `${getBackgroundColor((topic as any).goal_ods_id ?? undefined)} !important`,
                      opacity: 0.8,
                    },
                    '&:hover': {
                      backgroundColor: `${getBackgroundColor((topic as any).goal_ods_id ?? undefined)} !important`,
                      opacity: 0.9,
                    },
                  }}
                >
                  <ListItemText primary={topic.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Panel de Objetivos Específicos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Objetivos de la Acción
      </Typography>
            <List sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                },
              },
            }}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                objectives.map((objective) => (
                  <ListItem
                    key={objective.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ListItemText
                        primary={objective.description}
                        secondary={`Responsable: ${objective.responsible || 'NO DEFINIDO'}`}
                        primaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                        secondaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                      />
                    </Box>
                    {!readOnly && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(objective)}
                        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        Asignar
                      </Button>
                    )}
                  </ListItem>
                ))
              )}
              {!selectedTopic && (
                <ListItem>
                  <ListItemText primary="Seleccione un asunto de materialidad para ver sus objetivos específicos" />
                </ListItem>
              )}
              {selectedTopic && objectives.length === 0 && !loading && (
                <ListItem>
                  <ListItemText primary="No hay objetivos específicos para este asunto de materialidad" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para asignar responsable */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Asignar Responsable</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Escoja un responsable existente, o defina uno nuevo.
          </Typography>
          <Autocomplete
            freeSolo
            options={responsibles}
            value={selectedResponsible}
            inputValue={responsible}
            onInputChange={(event, newInputValue, reason) => {
              setResponsible(newInputValue);
              if (newInputValue !== '') {
                setSelectedResponsible('');
              }
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setResponsible(newValue);
                setSelectedResponsible('');
              } else if (newValue) {
                setSelectedResponsible(newValue);
                setResponsible(newValue);
              } else {
                setSelectedResponsible('');
                setResponsible('');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Responsable"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveResponsible} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignResponsibles; 