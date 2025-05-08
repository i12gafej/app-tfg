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
import { materialTopicService } from '@/services/materialTopicService';
import { actionPlanService } from '@/services/actionPlanService';
import { useAuth } from '@/hooks/useAuth';

interface MaterialTopic {
  id: number;
  name: string;
}

interface SpecificObjective {
  id: number;
  description: string;
  responsible?: string;
  material_topic_id: number;
  execution_time?: string;
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

  // Cargar asuntos relevantes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !report?.id) return;
      try {
        setLoading(true);
        const topics = await materialTopicService.getAllByReport(report.id, token);
        setMaterialTopics(topics);
      } catch (error) {
        console.error('Error al cargar asuntos de materialidad:', error);
        setError('Error al cargar los asuntos de materialidad');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setDialogOpen(true);
  };

  // Guardar responsable
  const handleSaveResponsible = async () => {
    if (!selectedObjective || !token) return;
    try {
      setLoading(true);
      await actionPlanService.updateSpecificObjective(
        selectedObjective.id,
        { responsible },
        token
      );
      // Recargar objetivos
      if (selectedTopic) {
        await loadObjectives(selectedTopic.id);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar responsable:', error);
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
                    secondaryAction={
                      !readOnly && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDialog(objective)}
                        >
                          Asignar
                        </Button>
                      )
                    }
                  >
                    <ListItemText
                      primary={objective.description}
                      secondary={`Responsable: ${objective.responsible || 'NO DEFINIDO'}`}
                    />
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
          <TextField
            autoFocus
            margin="dense"
            label="Responsable"
            fullWidth
            variant="outlined"
            value={responsible}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponsible(e.target.value)}
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