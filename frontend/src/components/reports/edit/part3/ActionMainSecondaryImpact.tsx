import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  OutlinedInput
} from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { useAuth } from '@/hooks/useAuth';
import { materialTopicService, sortMaterialTopics } from '@/services/materialTopicService';
import { actionPlanService } from '@/services/actionPlanService';
import { odsService, getBackgroundColor } from '@/services/odsService';
import type { MaterialTopic } from '@/services/materialTopicService';
import type { SpecificObjective, Action } from '@/services/actionPlanService';
import type { ODS } from '@/services/odsService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ActionMainSecondaryImpact = () => {
  const { report, readOnly } = useReport();
  const { token } = useAuth();
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);
  const [specificObjectives, setSpecificObjectives] = useState<SpecificObjective[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<SpecificObjective | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [odsList, setOdsList] = useState<ODS[]>([]);
  const [secondaryImpacts, setSecondaryImpacts] = useState<{ [key: number]: number[] }>({});
  const [changes, setChanges] = useState<{ [key: number]: boolean }>({});

  // Cargar ODS
  useEffect(() => {
    const fetchODS = async () => {
      if (!token) return;
      try {
        const response = await odsService.getAllODS(token);
        setOdsList(response.items);
      } catch (error) {
        console.error('Error al cargar ODS:', error);
        setError('Error al cargar los ODS');
      }
    };

    fetchODS();
  }, [token]);

  // Cargar asuntos relevantes
  useEffect(() => {
    const fetchMaterialTopics = async () => {
      if (!report || !token) return;
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

    fetchMaterialTopics();
  }, [report, token]);

  // Cargar objetivos específicos
  useEffect(() => {
    const fetchSpecificObjectives = async () => {
      if (!selectedTopic || !token) return;
      try {
        setLoading(true);
        const objectives = await actionPlanService.getSpecificObjectives(selectedTopic.id, token);
        setSpecificObjectives(objectives);
        setSelectedObjective(null);
        setActions([]);
      } catch (error) {
        console.error('Error al cargar objetivos específicos:', error);
        setError('Error al cargar los objetivos específicos');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificObjectives();
  }, [selectedTopic, token]);

  // Cargar acciones y sus impactos secundarios
  useEffect(() => {
    const fetchActionsAndImpacts = async () => {
      if (!selectedObjective || !token) return;
      try {
        setLoading(true);
        const actionsResponse = await actionPlanService.getActions(selectedObjective.id, token);
        setActions(actionsResponse);

        // Cargar impactos secundarios para cada acción
        const impactsData: { [key: number]: number[] } = {};
        for (const action of actionsResponse) {
          const response = await odsService.getActionSecondaryImpacts(action.id, token);
          impactsData[action.id] = response.ods_ids;
        }
        setSecondaryImpacts(impactsData);
      } catch (error) {
        console.error('Error al cargar acciones:', error);
        setError('Error al cargar las acciones');
      } finally {
        setLoading(false);
      }
    };

    fetchActionsAndImpacts();
  }, [selectedObjective, token]);

  const handleMainImpactChange = async (actionId: number, odsId: number | '') => {
    const updatedActions = actions.map(action =>
      action.id === actionId ? { ...action, ods_id: odsId || undefined } : action
    );
    setActions(updatedActions);
    setChanges(prev => ({ ...prev, [actionId]: true }));

    // Si se deselecciona el ODS principal, limpiar impactos secundarios
    if (odsId === '') {
      setSecondaryImpacts(prev => ({ ...prev, [actionId]: [] }));
    }
  };

  const handleSecondaryImpactChange = (actionId: number, selectedOdsIds: number[]) => {
    setSecondaryImpacts(prev => ({ ...prev, [actionId]: selectedOdsIds }));
    setChanges(prev => ({ ...prev, [actionId]: true }));
  };

  const handleSaveChanges = async (actionId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      const action = actions.find(a => a.id === actionId);
      if (!action) return;

      // Actualizar impacto principal
      await actionPlanService.updateAction(actionId, {
        description: action.description,
        difficulty: action.difficulty,
        ods_id: action.ods_id
      }, token);

      // Actualizar impactos secundarios
      await odsService.updateActionSecondaryImpacts(
        actionId,
        secondaryImpacts[actionId] || [],
        token
      );

      setChanges(prev => ({ ...prev, [actionId]: false }));
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setError('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Impactos Principales y Secundarios de las Acciones
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        {/* Panel de Asuntos de Materialidad */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Asunto de Materialidad</InputLabel>
              <Select
                value={selectedTopic?.id || ''}
                label="Asunto de Materialidad"
                onChange={(e: { target: { value: number } }) => {
                  const topic = materialTopics.find(t => t.id === e.target.value);
                  setSelectedTopic(topic || null);
                }}
              >
                {sortMaterialTopics(materialTopics).map((topic) => (
                  <MenuItem 
                    key={topic.id} 
                    value={topic.id}
                    style={{ backgroundColor: getBackgroundColor(topic.goal_ods_id ?? undefined) }}
                  >
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Panel de Objetivos Específicos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Objetivos de la Acción
            </Typography>
            <Box sx={{ 
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
              <Stack spacing={1}>
                {specificObjectives.map((objective) => (
                  <Card 
                    key={objective.id} 
                    variant="outlined"
                    onClick={() => setSelectedObjective(objective)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: selectedObjective?.id === objective.id ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2">
                        {objective.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                {selectedTopic && specificObjectives.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No hay objetivos específicos definidos
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Panel de Acciones y sus Impactos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Acciones e Impactos
            </Typography>
            <Box sx={{ 
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
              <Stack spacing={2}>
                {actions.map((action) => (
                  <Card 
                    key={action.id} 
                    variant="outlined"
                    sx={{ 
                      backgroundColor: getBackgroundColor(action.ods_id),
                      '&:hover': {
                        backgroundColor: getBackgroundColor(action.ods_id),
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="body1">
                        {action.description}
                      </Typography>
                        {!readOnly && changes[action.id] && (
                          <Tooltip title="Guardar cambios">
                            <IconButton
                              color="primary"
                              onClick={() => handleSaveChanges(action.id)}
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth disabled={readOnly}>
                            <InputLabel>Impacto Principal (ODS)</InputLabel>
                            <Select
                              value={action.ods_id || ''}
                              label="Impacto Principal (ODS)"
                              onChange={readOnly ? undefined : (e: { target: { value: string } }) => handleMainImpactChange(action.id, Number(e.target.value))}
                              disabled={readOnly}
                            >
                              <MenuItem value="">
                                <em>Ninguno</em>
                              </MenuItem>
                              {odsList.map((ods) => (
                                <MenuItem key={ods.id} value={ods.id}>
                                  {ods.id}. {ods.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth disabled={readOnly || !action.ods_id}>
                            <InputLabel>Impactos Secundarios (ODS)</InputLabel>
                            <Select
                              multiple
                              value={secondaryImpacts[action.id] || []}
                              input={<OutlinedInput label="Impactos Secundarios (ODS)" />}
                              onChange={readOnly ? undefined : (e: { target: { value: number[] } }) => {
                                const selectedIds = e.target.value;
                                const filteredIds = selectedIds.filter(id => id !== action.ods_id);
                                handleSecondaryImpactChange(action.id, filteredIds);
                              }}
                              disabled={!action.ods_id}
                              sx={{
                                '& .MuiMenuItem-root.Mui-selected': {
                                  backgroundColor: '#1976d2',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#1565c0',
                                  },
                                },
                                '& .MuiSelect-select': {
                                  cursor: readOnly ? 'default' : 'pointer'
                                }
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    '& .MuiMenuItem-root.Mui-selected': {
                                      backgroundColor: '#1976d2 !important',
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor: '#1565c0 !important',
                                      },
                                    },
                                    '& .MuiMenuItem-root': {
                                      cursor: readOnly ? 'default' : 'pointer',
                                      pointerEvents: readOnly ? 'none' : 'auto'
                                    }
                                  },
                                },
                              }}
                            >
                              {odsList.map((ods) => (
                                <MenuItem
                                  key={ods.id}
                                  value={ods.id}
                                  disabled={ods.id === action.ods_id}
                                >
                                  {ods.id}. {ods.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                {selectedObjective && actions.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No hay acciones definidas para este objetivo
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActionMainSecondaryImpact;
