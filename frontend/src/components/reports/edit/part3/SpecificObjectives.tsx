import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
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
  Alert,
  IconButton,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, sortMaterialTopics, MaterialTopic } from '@/services/materialTopicService';
import { actionPlanService, SpecificObjective, SpecificObjectiveCreate, SpecificObjectiveUpdate, Action, ActionCreate, ActionUpdate, PerformanceIndicator, PerformanceIndicatorCreate, PerformanceIndicatorUpdate } from '@/services/actionPlanService';
import { useAuth } from '@/hooks/useAuth';
import { getBackgroundColor } from '@/services/odsService';
import Autocomplete from '@mui/material/Autocomplete';

const SpecificObjectives = () => {
  const { report, readOnly } = useReport();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);
  const [specificObjectives, setSpecificObjectives] = useState<SpecificObjective[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newObjective, setNewObjective] = useState<SpecificObjectiveCreate>({
    description: '',
    material_topic_id: 0
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState<SpecificObjective | null>(null);
  const [objectiveToEdit, setObjectiveToEdit] = useState<SpecificObjective | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<SpecificObjectiveUpdate>({
    description: '',
    responsible: ''
  });
  const [selectedObjective, setSelectedObjective] = useState<SpecificObjective | null>(null);
  const [actions, setActions] = useState<Action[]>([]);

  // Estados para gestión de acciones
  const [openCreateActionDialog, setOpenCreateActionDialog] = useState(false);
  const [openEditActionDialog, setOpenEditActionDialog] = useState(false);
  const [openDeleteActionDialog, setOpenDeleteActionDialog] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<Action | null>(null);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);
  const [newAction, setNewAction] = useState<ActionCreate>({
    description: '',
    difficulty: 'low',
    execution_time: '',
    specific_objective_id: 0
  });
  const [editActionData, setEditActionData] = useState<ActionUpdate>({
    description: '',
    difficulty: 'low',
    execution_time: ''
  });

  // Estados para gestión de indicadores
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [indicators, setIndicators] = useState<PerformanceIndicator[]>([]);
  const [openCreateIndicatorDialog, setOpenCreateIndicatorDialog] = useState(false);
  const [newIndicator, setNewIndicator] = useState<PerformanceIndicatorCreate>({
    name: '',
    human_resources: '',
    material_resources: '',
    type: 'quantitative',
    action_id: 0,
    numeric_response: 0,
    unit: '',
    response: ''
  });

  // Estados para gestión de indicadores
  const [openEditIndicatorDialog, setOpenEditIndicatorDialog] = useState(false);
  const [openDeleteIndicatorDialog, setOpenDeleteIndicatorDialog] = useState(false);
  const [indicatorToEdit, setIndicatorToEdit] = useState<PerformanceIndicator | null>(null);
  const [indicatorToDelete, setIndicatorToDelete] = useState<PerformanceIndicator | null>(null);
  const [editIndicatorData, setEditIndicatorData] = useState<PerformanceIndicatorUpdate>({
    name: '',
    human_resources: '',
    material_resources: '',
    type: 'quantitative',
    numeric_response: 0,
    unit: '',
    response: ''
  });

  // Estados para opción personalizada de tiempo de ejecución
  const [customExecutionTime, setCustomExecutionTime] = useState('');
  const [editCustomExecutionTime, setEditCustomExecutionTime] = useState('');

  // Cargar asuntos relevantes al montar el componente
  useEffect(() => {
    const fetchMaterialTopics = async () => {
      if (!report || !token) return;
      try {
        setLoading(true);
        const topics = await materialTopicService.getAllByReport(report.id, token);
        setMaterialTopics(sortMaterialTopics<MaterialTopic>(topics));
      } catch (error) {
        console.error('Error al cargar asuntos de materialidad:', error);
        setError('Error al cargar los asuntos de materialidad');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialTopics();
  }, [report, token]);

  // Cargar objetivos específicos cuando se selecciona un asunto de materialidad
  useEffect(() => {
    const fetchSpecificObjectives = async () => {
      if (!selectedTopic || !token) return;
      try {
        setLoading(true);
        const objectives = await actionPlanService.getSpecificObjectives(selectedTopic.id, token);
        setSpecificObjectives(objectives);
      } catch (error) {
        console.error('Error al cargar objetivos específicos:', error);
        setError('Error al cargar los objetivos específicos');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificObjectives();
  }, [selectedTopic, token]);

  // Cargar acciones cuando se selecciona un objetivo específico
  useEffect(() => {
    const fetchActions = async () => {
      if (!token || !selectedObjective) {
        setActions([]);
        return;
      }
      try {
        setLoading(true);
        const response = await actionPlanService.getActions(selectedObjective.id, token);
        setActions(response);
      } catch (error) {
        console.error('Error al cargar acciones:', error);
        setError('Error al cargar las acciones');
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [selectedObjective, token]);

  // Cargar indicadores cuando se selecciona una acción
  useEffect(() => {
    const fetchIndicators = async () => {
      if (!token || !selectedAction) {
        setIndicators([]);
        return;
      }
      try {
        setLoading(true);
        const response = await actionPlanService.getPerformanceIndicators(selectedAction.id, token);
        setIndicators(response);
      } catch (error) {
        console.error('Error al cargar indicadores:', error);
        setError('Error al cargar los indicadores');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, [selectedAction, token]);

  const handleCreateObjective = async () => {
    if (!token || !selectedTopic) return;
    try {
      setLoading(true);
      const data = {
        ...newObjective,
        material_topic_id: selectedTopic.id
      };
      const response = await actionPlanService.createSpecificObjective(data, token);
      setSpecificObjectives(prev => [...prev, response]);
      setOpenCreateDialog(false);
      setNewObjective({
        description: '',
        material_topic_id: 0
      });
    } catch (error) {
      console.error('Error al crear objetivo específico:', error);
      setError('Error al crear el objetivo específico');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (objective: SpecificObjective) => {
    setObjectiveToDelete(objective);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !objectiveToDelete) return;
    try {
      setLoading(true);
      await actionPlanService.deleteSpecificObjective(objectiveToDelete.id, token);
      setSpecificObjectives(prev => prev.filter(obj => obj.id !== objectiveToDelete.id));
      setOpenDeleteDialog(false);
      setObjectiveToDelete(null);
    } catch (error) {
      console.error('Error al eliminar objetivo específico:', error);
      setError('Error al eliminar el objetivo específico');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (objective: SpecificObjective) => {
    setObjectiveToEdit(objective);
    setEditFormData({
      description: objective.description || '',
      responsible: objective.responsible || ''
    });
    setOpenEditDialog(true);
  };

  const handleEditConfirm = async () => {
    if (!token || !objectiveToEdit) return;
    try {
      setLoading(true);
      const updatedObjective = await actionPlanService.updateSpecificObjective(
        objectiveToEdit.id,
        editFormData,
        token
      );
      setSpecificObjectives(prev => 
        prev.map(obj => obj.id === updatedObjective.id ? updatedObjective : obj)
      );
      setOpenEditDialog(false);
      setObjectiveToEdit(null);
      setEditFormData({
        description: '',
        responsible: ''
      });
    } catch (error) {
      console.error('Error al actualizar objetivo específico:', error);
      setError('Error al actualizar el objetivo específico');
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveClick = (objective: SpecificObjective) => {
    if (objective.id === selectedObjective?.id) {
      setSelectedObjective(null);
      setActions([]);
      setSelectedAction(null);
      setIndicators([]);
    } else {
      setSelectedObjective(objective);
      setSelectedAction(null);
      setIndicators([]);
    }
  };

  // Funciones para gestionar acciones
  const handleCreateAction = async () => {
    if (!token || !selectedObjective) return;
    try {
      setLoading(true);
      const data = {
        ...newAction,
        specific_objective_id: selectedObjective.id
      };
      const response = await actionPlanService.createAction(data, token);
      setActions(prev => [...prev, response]);
      setOpenCreateActionDialog(false);
      setNewAction({
        description: '',
        difficulty: 'low',
        execution_time: '',
        specific_objective_id: 0
      });
    } catch (error) {
      console.error('Error al crear acción:', error);
      setError('Error al crear la acción');
    } finally {
      setLoading(false);
    }
  };

  const handleEditActionClick = (action: Action) => {
    setActionToEdit(action);
    setEditActionData({
      description: action.description || '',
      difficulty: action.difficulty || 'low',
      execution_time: action.execution_time || ''
    });
    setOpenEditActionDialog(true);
  };

  const handleEditActionConfirm = async () => {
    if (!token || !actionToEdit) return;
    try {
      setLoading(true);
      const updatedAction = await actionPlanService.updateAction(
        actionToEdit.id,
        editActionData,
        token
      );
      setActions(prev => prev.map(action => 
        action.id === updatedAction.id ? updatedAction : action
      ));
      setOpenEditActionDialog(false);
      setActionToEdit(null);
    } catch (error) {
      console.error('Error al actualizar acción:', error);
      setError('Error al actualizar la acción');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActionClick = (action: Action) => {
    setActionToDelete(action);
    setOpenDeleteActionDialog(true);
  };

  const handleDeleteActionConfirm = async () => {
    if (!token || !actionToDelete) return;
    try {
      setLoading(true);
      await actionPlanService.deleteAction(actionToDelete.id, token);
      setActions(prev => prev.filter(action => action.id !== actionToDelete.id));
      setOpenDeleteActionDialog(false);
      setActionToDelete(null);
    } catch (error) {
      console.error('Error al eliminar acción:', error);
      setError('Error al eliminar la acción');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: Action) => {
    setSelectedAction(action.id === selectedAction?.id ? null : action);
  };

  const handleCreateIndicator = async () => {
    if (!token || !selectedAction) return;
    try {
      setLoading(true);
      const data = {
        ...newIndicator,
        action_id: selectedAction.id
      };
      const response = await actionPlanService.createPerformanceIndicator(data, token);
      setIndicators(prev => [...prev, response]);
      setOpenCreateIndicatorDialog(false);
      setNewIndicator({
        name: '',
        human_resources: '',
        material_resources: '',
        type: 'quantitative',
        action_id: 0,
        numeric_response: 0,
        unit: '',
        response: ''
      });
    } catch (error) {
      console.error('Error al crear indicador:', error);
      setError('Error al crear el indicador');
    } finally {
      setLoading(false);
    }
  };

  const handleEditIndicatorClick = (indicator: PerformanceIndicator) => {
    setIndicatorToEdit(indicator);
    setEditIndicatorData({
      name: indicator.name,
      human_resources: indicator.human_resources || '',
      material_resources: indicator.material_resources || '',
      type: indicator.type,
      numeric_response: indicator.quantitative_data?.numeric_response || 0,
      unit: indicator.quantitative_data?.unit || '',
      response: indicator.qualitative_data?.response || ''
    });
    setOpenEditIndicatorDialog(true);
  };

  const handleEditIndicatorConfirm = async () => {
    if (!indicatorToEdit || !token) return;

    try {
      await actionPlanService.updatePerformanceIndicator(
        indicatorToEdit.id,
        editIndicatorData,
        token
      );
      setOpenEditIndicatorDialog(false);
      setIndicatorToEdit(null);
      setEditIndicatorData({
        name: '',
        human_resources: '',
        material_resources: '',
        type: 'quantitative',
        numeric_response: 0,
        unit: '',
        response: ''
      });

      // Cargar los indicadores actualizados
      if (selectedAction) {
        const updatedIndicators = await actionPlanService.getPerformanceIndicators(
          selectedAction.id,
          token
        );
        setIndicators(updatedIndicators);
      }
    } catch (error) {
      console.error('Error al actualizar indicador:', error);
      setError('Error al actualizar el indicador');
    }
  };

  const handleDeleteIndicatorClick = (indicator: PerformanceIndicator) => {
    setIndicatorToDelete(indicator);
    setOpenDeleteIndicatorDialog(true);
  };

  const handleDeleteIndicatorConfirm = async () => {
    if (!token || !indicatorToDelete) return;
    try {
      setLoading(true);
      await actionPlanService.deletePerformanceIndicator(indicatorToDelete.id, token);
      setIndicators(prev => prev.filter(ind => ind.id !== indicatorToDelete.id));
      setOpenDeleteIndicatorDialog(false);
      setIndicatorToDelete(null);
    } catch (error) {
      console.error('Error al eliminar indicador:', error);
      setError('Error al eliminar el indicador');
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
        Objetivos de la Acción
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Selector de Asunto de Materialidad */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Asunto de Materialidad</InputLabel>
          <Select
            value={selectedTopic?.id || ''}
            label="Asunto de Materialidad"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const topic = materialTopics.find(t => t.id === Number(e.target.value));
              setSelectedTopic(topic || null);
              setSelectedObjective(null);
              setActions([]);
              setSelectedAction(null);
              setIndicators([]);
            }}
          >
            {materialTopics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id} style={{ backgroundColor: getBackgroundColor((topic as any).goal_ods_id ?? undefined) }}>
                {topic.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Grid container spacing={2}>
        {/* Panel de Objetivos Específicos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Objetivos 
              </Typography>
              {selectedTopic && !readOnly && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{ 
                    fontSize: '0.75rem',
                    py: 0.5,
                    minWidth: '140px'
                  }}
                >
                  Nuevo Objetivo
                </Button>
              )}
            </Box>
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
                    onClick={() => handleObjectiveClick(objective)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: selectedObjective?.id === objective.id ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <CardContent sx={{ 
                      p: 2, 
                      '&:last-child': { pb: 2 },
                      position: 'relative',
                      pr: 8
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {objective.description}
                      </Typography>
                      {!readOnly && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 1
                        }}>
                          <IconButton
                            size="small"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleEditClick(objective);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(objective)}
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {selectedTopic && specificObjectives.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No hay objetivos específicos definidos
                  </Typography>
                )}
                {!selectedTopic && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Seleccione un asunto de materialidad para ver sus objetivos
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Panel de Acciones */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Acciones
              </Typography>
              {!readOnly && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={!selectedObjective}
                  onClick={() => setOpenCreateActionDialog(true)}
                  sx={{ 
                    fontSize: '0.75rem',
                    py: 0.5
                  }}
                >
                  Nueva Acción
                </Button>
              )}
            </Box>
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
                {actions.map((action) => (
                  <Card 
                    key={action.id} 
                    variant="outlined"
                    onClick={() => handleActionClick(action)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: selectedAction?.id === action.id ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <CardContent sx={{ 
                      p: 2, 
                      '&:last-child': { pb: 2 },
                      position: 'relative',
                      pr: 8
                    }}>
                      <Typography variant="body1" component="div" sx={{ mb: 1 }}>
                        {action.description}
                      </Typography>
                      {action.difficulty && (
                        <Typography variant="body2" color="text.secondary">
                          Dificultad: {action.difficulty === 'low' ? 'Baja' : action.difficulty === 'medium' ? 'Media' : 'Alta'}
                        </Typography>
                      )}
                      {action.execution_time && (
                        <Typography variant="body2" color="text.secondary">
                          Tiempo de ejecución: {action.execution_time}
                        </Typography>
                      )}
                      {!readOnly && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 1
                        }}>
                          <IconButton
                            size="small"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleEditActionClick(action);
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleDeleteActionClick(action);
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {selectedObjective && actions.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No hay acciones definidas para este objetivo
                  </Typography>
                )}
                {!selectedObjective && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Seleccione un objetivo específico para ver sus acciones
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Panel de Indicadores */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Indicadores
              </Typography>
              {!readOnly && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={!selectedAction}
                  onClick={() => setOpenCreateIndicatorDialog(true)}
                  sx={{ 
                    fontSize: '0.75rem',
                    py: 0.5,
                    minWidth: '140px'
                  }}
                >
                  Nuevo Indicador
                </Button>
              )}
            </Box>
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
                {indicators.map((indicator) => (
                  <Card key={indicator.id} variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, position: 'relative', pr: 10 }}>
                      <Typography variant="body1" component="div" sx={{ mb: 1 }}>
                        {indicator.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tipo: {indicator.type === 'quantitative' ? 'Cuantitativo' : 'Cualitativo'}
                      </Typography>
                      {indicator.human_resources && (
                        <Typography variant="body2" color="text.secondary">
                          Recursos Humanos: {indicator.human_resources}
                        </Typography>
                      )}
                      {indicator.material_resources && (
                        <Typography variant="body2" color="text.secondary">
                          Recursos Materiales: {indicator.material_resources}
                        </Typography>
                      )}
                      {indicator.type === 'quantitative' && indicator.quantitative_data && (
                        <Typography variant="body2" color="text.secondary">
                          Valor: {indicator.quantitative_data.numeric_response} {indicator.quantitative_data.unit}
                        </Typography>
                      )}
                      {indicator.type === 'qualitative' && indicator.qualitative_data && (
                        <Typography variant="body2" color="text.secondary">
                          Valor: {indicator.qualitative_data.response}
                        </Typography>
                      )}
                      {!readOnly && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 1
                        }}>
                          <IconButton
                            size="small"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleEditIndicatorClick(indicator);
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleDeleteIndicatorClick(indicator);
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {selectedAction && indicators.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No hay indicadores definidos para esta acción
                  </Typography>
                )}
                {!selectedAction && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Seleccione una acción para ver sus indicadores
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para crear nuevo objetivo específico */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Crear Nuevo Objetivo Específico</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Descripción"
            value={newObjective.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewObjective({ ...newObjective, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateObjective} 
            variant="contained"
            disabled={!newObjective.description.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar objetivo específico */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Editar Objetivo Específico</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            value={editFormData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Responsable"
            type="text"
            fullWidth
            value={editFormData.responsible}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, responsible: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditConfirm} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este objetivo específico?
          </Typography>
          {objectiveToDelete && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {objectiveToDelete.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para crear nueva acción */}
      <Dialog open={openCreateActionDialog} onClose={() => setOpenCreateActionDialog(false)}>
        <DialogTitle>Crear Nueva Acción</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Descripción"
            value={newAction.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAction({ ...newAction, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Dificultad</InputLabel>
            <Select
              value={newAction.difficulty}
              label="Dificultad"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAction({ ...newAction, difficulty: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Elija el tiempo de ejecución o defina otro diferente.
          </Typography>
          <Autocomplete
            freeSolo
            options={["1 año", "3 años", "5 años"]}
            value={newAction.execution_time || ''}
            inputValue={newAction.execution_time || ''}
            onInputChange={(event, newInputValue) => {
              setNewAction({ ...newAction, execution_time: newInputValue });
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setNewAction({ ...newAction, execution_time: newValue });
              } else if (newValue) {
                setNewAction({ ...newAction, execution_time: newValue });
              } else {
                setNewAction({ ...newAction, execution_time: '' });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tiempo de Ejecución"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateActionDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateAction}
            variant="contained"
            disabled={!newAction.description.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar acción */}
      <Dialog open={openEditActionDialog} onClose={() => setOpenEditActionDialog(false)}>
        <DialogTitle>Editar Acción</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Descripción"
            value={editActionData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditActionData({ ...editActionData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Dificultad</InputLabel>
            <Select
              value={editActionData.difficulty}
              label="Dificultad"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditActionData({ ...editActionData, difficulty: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Elija el tiempo de ejecución o defina otro diferente.
          </Typography>
          <Autocomplete
            freeSolo
            options={["1 año", "3 años", "5 años"]}
            value={editActionData.execution_time || ''}
            inputValue={editActionData.execution_time || ''}
            onInputChange={(event, newInputValue) => {
              setEditActionData({ ...editActionData, execution_time: newInputValue });
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setEditActionData({ ...editActionData, execution_time: newValue });
              } else if (newValue) {
                setEditActionData({ ...editActionData, execution_time: newValue });
              } else {
                setEditActionData({ ...editActionData, execution_time: '' });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tiempo de Ejecución"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditActionDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleEditActionConfirm}
            variant="contained"
            disabled={!editActionData.description?.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación de acción */}
      <Dialog open={openDeleteActionDialog} onClose={() => setOpenDeleteActionDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar esta acción?
          </Typography>
          {actionToDelete && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {actionToDelete.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteActionDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteActionConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para crear nuevo indicador */}
      <Dialog open={openCreateIndicatorDialog} onClose={() => setOpenCreateIndicatorDialog(false)}>
        <DialogTitle>Crear Nuevo Indicador</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={newIndicator.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Recursos Humanos"
            value={newIndicator.human_resources}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, human_resources: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Recursos Materiales"
            value={newIndicator.material_resources}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, material_resources: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newIndicator.type}
              label="Tipo"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ 
                ...newIndicator, 
                type: e.target.value as 'quantitative' | 'qualitative',
                // Resetear los campos específicos al cambiar el tipo
                numeric_response: e.target.value === 'quantitative' ? 0 : undefined,
                unit: e.target.value === 'quantitative' ? '' : undefined,
                response: e.target.value === 'qualitative' ? '' : undefined
              })}
            >
              <MenuItem value="quantitative">Cuantitativo</MenuItem>
              <MenuItem value="qualitative">Cualitativo</MenuItem>
            </Select>
          </FormControl>

          {newIndicator.type === 'quantitative' && (
            <>
              <TextField
                fullWidth
                label="Valor Numérico"
                type="number"
                value={newIndicator.numeric_response || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ 
                  ...newIndicator, 
                  numeric_response: Number(e.target.value)
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Unidad"
                value={newIndicator.unit || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ 
                  ...newIndicator, 
                  unit: e.target.value
                })}
                margin="normal"
              />
            </>
          )}

          {newIndicator.type === 'qualitative' && (
            <TextField
              fullWidth
              label="Valor"
              value={newIndicator.response || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ 
                ...newIndicator, 
                response: e.target.value
              })}
              margin="normal"
              multiline
              rows={3}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateIndicatorDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateIndicator}
            variant="contained"
            disabled={!newIndicator.name.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar indicador */}
      <Dialog open={openEditIndicatorDialog} onClose={() => setOpenEditIndicatorDialog(false)}>
        <DialogTitle>Editar Indicador</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={editIndicatorData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIndicatorData({ ...editIndicatorData, name: e.target.value })}
            margin="normal"
            multiline
            minRows={1}
            maxRows={6}
          />
          <TextField
            fullWidth
            label="Recursos Humanos"
            value={editIndicatorData.human_resources}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIndicatorData({ ...editIndicatorData, human_resources: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Recursos Materiales"
            value={editIndicatorData.material_resources}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIndicatorData({ ...editIndicatorData, material_resources: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={editIndicatorData.type}
              label="Tipo"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setEditIndicatorData({ 
                ...editIndicatorData, 
                type: e.target.value as 'quantitative' | 'qualitative',
                numeric_response: e.target.value === 'quantitative' ? editIndicatorData.numeric_response || 0 : undefined,
                unit: e.target.value === 'quantitative' ? editIndicatorData.unit || '' : undefined,
                response: e.target.value === 'qualitative' ? editIndicatorData.response || '' : undefined
              })}
            >
              <MenuItem value="quantitative">Cuantitativo</MenuItem>
              <MenuItem value="qualitative">Cualitativo</MenuItem>
            </Select>
          </FormControl>

          {editIndicatorData.type === 'quantitative' && (
            <>
              <TextField
                fullWidth
                label="Valor Numérico"
                type="number"
                value={editIndicatorData.numeric_response || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIndicatorData({ 
                  ...editIndicatorData, 
                  numeric_response: Number(e.target.value)
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Unidad"
                value={editIndicatorData.unit || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIndicatorData({ 
                  ...editIndicatorData, 
                  unit: e.target.value
                })}
                margin="normal"
              />
            </>
          )}

          {editIndicatorData.type === 'qualitative' && (
            <TextField
              fullWidth
              label="Valor"
              value={editIndicatorData.response || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIndicatorData({ 
                ...editIndicatorData, 
                response: e.target.value
              })}
              margin="normal"
              multiline
              rows={3}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditIndicatorDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleEditIndicatorConfirm}
            variant="contained"
            disabled={!editIndicatorData.name?.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación de indicador */}
      <Dialog open={openDeleteIndicatorDialog} onClose={() => setOpenDeleteIndicatorDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este indicador?
          </Typography>
          {indicatorToDelete && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {indicatorToDelete.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteIndicatorDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteIndicatorConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecificObjectives; 