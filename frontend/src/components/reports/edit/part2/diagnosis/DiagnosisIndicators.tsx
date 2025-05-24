import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/context/auth.context';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, sortMaterialTopics, MaterialTopic } from '@/services/materialTopicService';
import { getBackgroundColor } from '@/services/odsService';
import { diagnosisIndicatorService, DiagnosisIndicator, DiagnosisIndicatorCreate, DiagnosisIndicatorUpdate } from '@/services/diagnosisIndicatorService';
import DiagnosisIndicatorsDeleteDialog from './DiagnosisIndicators/DiagnosisIndicatorsDeleteDialog';

const DiagnosisIndicators: React.FC = () => {
  const { token } = useAuth();
  const { report, readOnly } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);
  const [allIndicators, setAllIndicators] = useState<DiagnosisIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<DiagnosisIndicator | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newIndicator, setNewIndicator] = useState<DiagnosisIndicatorCreate>({
    name: '',
    type: 'quantitative',
    material_topic_id: 0,
    numeric_response: 0,
    unit: '',
    response: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<DiagnosisIndicator | null>(null);

  // Función para cargar los indicadores
  const fetchIndicators = async () => {
    if (!token || !report) return;
    try {
      setLoading(true);
      const response = await diagnosisIndicatorService.getAllByReport(report.id, token);
      setAllIndicators(response);
    } catch (error) {
      console.error('Error al cargar indicadores:', error);
      setError('Error al cargar los indicadores');
    } finally {
      setLoading(false);
    }
  };

  // Cargar asuntos relevantes y todos los indicadores al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !report) return;
      try {
        setLoading(true);
        const [topicsResponse, indicatorsResponse] = await Promise.all([
          materialTopicService.getAllByReport(report.id, token),
          diagnosisIndicatorService.getAllByReport(report.id, token)
        ]);
        setMaterialTopics(sortMaterialTopics<MaterialTopic>(topicsResponse || []));
        setAllIndicators(indicatorsResponse);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, report]);

  // Filtrar indicadores según el material topic seleccionado
  const filteredIndicators = selectedTopic
    ? allIndicators.filter(indicator => indicator.material_topic_id === selectedTopic.id)
    : [];

  const handleCreateIndicator = async () => {
    if (!token || !selectedTopic) return;
    try {
      setLoading(true);
      const data = {
        ...newIndicator,
        material_topic_id: selectedTopic.id
      };
      const response = await diagnosisIndicatorService.createIndicator(data, token);
      setAllIndicators(prev => [...prev, response]);
      setOpenCreateDialog(false);
      setNewIndicator({
        name: '',
        type: 'quantitative',
        material_topic_id: 0,
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

  const handleUpdateIndicator = async () => {
    if (!selectedIndicator) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Preparar los datos de actualización
      const updateData: DiagnosisIndicatorUpdate = {
        name: selectedIndicator.name,
        type: selectedIndicator.type
      };

      // Agregar los datos específicos según el tipo
      if (selectedIndicator.type === 'quantitative') {
        updateData.numeric_response = selectedIndicator.quantitative_data?.numeric_response;
        updateData.unit = selectedIndicator.quantitative_data?.unit;
      } else {
        updateData.response = selectedIndicator.qualitative_data?.response;
      }

      // Actualizar el indicador
      const updatedIndicator = await diagnosisIndicatorService.updateIndicator(
        selectedIndicator.id,
        updateData,
        token
      );

      // Obtener el indicador actualizado con todos sus datos
      const refreshedIndicator = await diagnosisIndicatorService.getIndicator(updatedIndicator.id, token);

      // Actualizar el estado con el indicador refrescado
      setAllIndicators(prev => 
        prev.map(indicator => 
          indicator.id === refreshedIndicator.id ? refreshedIndicator : indicator
        )
      );
      setSelectedIndicator(refreshedIndicator);
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error al actualizar indicador:', error);
      setError('Error al actualizar el indicador');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (indicator: DiagnosisIndicator) => {
    setIndicatorToDelete(indicator);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !indicatorToDelete) return;
    try {
      setLoading(true);
      await diagnosisIndicatorService.deleteIndicator(indicatorToDelete.id, token);
      setAllIndicators(prev => prev.filter(ind => ind.id !== indicatorToDelete.id));
      if (selectedIndicator?.id === indicatorToDelete.id) {
        setSelectedIndicator(null);
      }
      setOpenDeleteDialog(false);
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
        Indicadores de Diagnóstico
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Panel de Asuntos de Materialidad */}
        <Grid item xs={12} md={4}>
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
                  onClick={() => setSelectedTopic(topic)}
                  sx={{ '&.Mui-selected': {
                      backgroundColor:  "#606060 !important",
                      color: "white !important",
                      opacity: 1,
                    },
                    '&:hover': {
                      backgroundColor: "#B0B0B0 !important",
                      color: "white !important",
                      opacity: 1,
                    },
                    backgroundColor: getBackgroundColor((topic as any).goal_ods_id ?? undefined) }}
                >
                  <ListItemText primary={topic.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Panel de Indicadores */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Indicadores
              </Typography>
              {selectedTopic && (
                !readOnly && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenCreateDialog(true)}
                  >
                    Nuevo Indicador
                  </Button>
                )
              )}
            </Box>
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
              {filteredIndicators.map((indicator) => (
                <ListItem
                  key={indicator.id}
                  button
                  selected={selectedIndicator?.id === indicator.id}
                  onClick={() => setSelectedIndicator(indicator)}
                  secondaryAction={
                    !readOnly && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteClick(indicator)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={indicator.name}
                    secondary={`Tipo: ${indicator.type === 'quantitative' ? 'Cuantitativo' : 'Cualitativo'}`}
                  />
                </ListItem>
              ))}
              {selectedTopic && filteredIndicators.length === 0 && (
                <ListItem>
                  <ListItemText primary="No hay indicadores para este asunto de materialidad" />
                </ListItem>
              )}
              {!selectedTopic && (
                <ListItem>
                  <ListItemText primary="Seleccione un asunto de materialidad para ver sus indicadores" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Panel de Detalles del Indicador */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalles del Indicador
            </Typography>
            {selectedIndicator ? (
              <Box>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={selectedIndicator.name}
                  onChange={readOnly ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIndicator({
                    ...selectedIndicator,
                    name: e.target.value
                  })}
                  disabled={readOnly}
                  margin="normal"
                  multiline
                  minRows={1}
                  maxRows={6}
                />
                <FormControl fullWidth margin="normal" disabled={readOnly}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={selectedIndicator.type}
                    label="Tipo"
                    onChange={readOnly ? undefined : (e: React.ChangeEvent<{ value: unknown }>) => setSelectedIndicator({
                      ...selectedIndicator,
                      type: e.target.value as 'quantitative' | 'qualitative'
                    })}
                    disabled={readOnly}
                  >
                    <MenuItem value="quantitative">Cuantitativo</MenuItem>
                    <MenuItem value="qualitative">Cualitativo</MenuItem>
                  </Select>
                </FormControl>

                {selectedIndicator.type === 'quantitative' ? (
                  <>
                    <TextField
                      fullWidth
                      label="Valor Numérico"
                      type="number"
                      value={selectedIndicator.quantitative_data?.numeric_response || ''}
                      onChange={readOnly ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIndicator({
                        ...selectedIndicator,
                        quantitative_data: {
                          diagnosis_indicator_id: selectedIndicator.id,
                          numeric_response: Number(e.target.value),
                          unit: selectedIndicator.quantitative_data?.unit || ''
                        }
                      })}
                      disabled={readOnly}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Unidad"
                      value={selectedIndicator.quantitative_data?.unit || ''}
                      onChange={readOnly ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIndicator({
                        ...selectedIndicator,
                        quantitative_data: {
                          diagnosis_indicator_id: selectedIndicator.id,
                          numeric_response: selectedIndicator.quantitative_data?.numeric_response || 0,
                          unit: e.target.value
                        }
                      })}
                      disabled={readOnly}
                      margin="normal"
                    />
                  </>
                ) : (
                  <TextField
                    fullWidth
                    label="Valor"
                    multiline
                    rows={4}
                    value={selectedIndicator.qualitative_data?.response || ''}
                    onChange={readOnly ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIndicator({
                      ...selectedIndicator,
                      qualitative_data: {
                        diagnosis_indicator_id: selectedIndicator.id,
                        response: e.target.value
                      }
                    })}
                    disabled={readOnly}
                    margin="normal"
                  />
                )}

                {!readOnly && (
                  <Button
                    variant="contained"
                    onClick={() => setOpenEditDialog(true)}
                    sx={{ mt: 2 }}
                  >
                    Guardar Cambios
                  </Button>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Seleccione un indicador para ver sus detalles
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para crear nuevo indicador */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Crear Nuevo Indicador</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={newIndicator.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, name: e.target.value })}
            margin="normal"
            disabled={readOnly}
            multiline
            minRows={1}
            maxRows={6}
          />
          <FormControl fullWidth margin="normal" disabled={readOnly}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newIndicator.type}
              label="Tipo"
              onChange={readOnly ? undefined : (e: React.ChangeEvent<{ value: unknown }>) => setNewIndicator({ ...newIndicator, type: e.target.value as 'quantitative' | 'qualitative' })}
              disabled={readOnly}
            >
              <MenuItem value="quantitative">Cuantitativo</MenuItem>
              <MenuItem value="qualitative">Cualitativo</MenuItem>
            </Select>
          </FormControl>

          {newIndicator.type === 'quantitative' ? (
            <>
              <TextField
                fullWidth
                label="Valor Numérico"
                type="number"
                value={newIndicator.numeric_response || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, numeric_response: Number(e.target.value) })}
                margin="normal"
                disabled={readOnly}
              />
              <TextField
                fullWidth
                label="Unidad"
                value={newIndicator.unit || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, unit: e.target.value })}
                margin="normal"
                disabled={readOnly}
              />
            </>
          ) : (
            <TextField
              fullWidth
              label="Valor"
              multiline
              rows={4}
              value={newIndicator.response || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIndicator({ ...newIndicator, response: e.target.value })}
              margin="normal"
              disabled={readOnly}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          {!readOnly && (
            <Button onClick={handleCreateIndicator} variant="contained">
              Crear
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar edición */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Confirmar Cambios</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea guardar los cambios en este indicador?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          {!readOnly && (
            <Button onClick={handleUpdateIndicator} variant="contained">
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Agregar el diálogo de eliminación */}
      <DiagnosisIndicatorsDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setIndicatorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        indicator={indicatorToDelete}
      />
    </Box>
  );
};

export default DiagnosisIndicators; 