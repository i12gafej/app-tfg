import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Grid, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { materialTopicService, PriorityLevel } from '@/services/materialTopicService';

interface MaterialTopic {
  id: number;
  name: string;
  main_objective?: string;
  priority?: string;
}

const priorityOptions = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' }
];

const MainObjective = () => {
  const { report, readOnly } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);
  const [mainObjectiveValue, setMainObjectiveValue] = useState<string>('');

  useEffect(() => {
    const fetchMaterialTopics = async () => {
      if (!report) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }
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
  }, [report]);

  useEffect(() => {
    setMainObjectiveValue(selectedTopic?.main_objective || '');
  }, [selectedTopic]);

  const handlePriorityChange = (event: any) => {
    if (!selectedTopic) return;
    setSelectedTopic({ ...selectedTopic, priority: event.target.value as PriorityLevel });
  };

  const handleSave = async () => {
    if (!selectedTopic) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const updatedTopic = await materialTopicService.updateMaterialTopic(
        selectedTopic.id,
        { main_objective: mainObjectiveValue, priority: selectedTopic.priority as PriorityLevel },
        token
      );

      // Actualizar el topic en la lista local
      setMaterialTopics(prevTopics =>
        prevTopics.map(topic =>
          topic.id === updatedTopic.id ? { ...topic, main_objective: updatedTopic.main_objective, priority: updatedTopic.priority } : topic
        )
      );
      setSelectedTopic({ ...selectedTopic, main_objective: updatedTopic.main_objective, priority: updatedTopic.priority });
      setSuccessMessage('Objetivo principal guardado correctamente');
    } catch (err) {
      console.error('Error al guardar el objetivo principal:', err);
      setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Objetivo Principal
      </Typography>

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
                >
                  <ListItemText primary={topic.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Panel del Objetivo Principal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="subtitle1">
                Objetivo Principal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {readOnly ? (
                  <Box sx={{ minWidth: 120, mr: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Prioridad: {selectedTopic?.priority ? priorityOptions.find(opt => opt.value === selectedTopic.priority)?.label : 'Sin prioridad'}
                    </Typography>
                  </Box>
                ) : (
                  <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel id="priority-label">Prioridad</InputLabel>
                    <Select
                      labelId="priority-label"
                      value={selectedTopic?.priority ? selectedTopic.priority : ''}
                      label="Prioridad"
                      onChange={handlePriorityChange}
                    >
                      {priorityOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {!readOnly && selectedTopic && (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {selectedTopic ? (
              <Box sx={{
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                p: 2
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Descripción del objetivo principal</Typography>
                {readOnly ? (
                  <Box sx={{
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    p: 2,
                    minHeight: 120,
                    whiteSpace: 'pre-line',
                    color: 'text.primary',
                    fontSize: '1rem',
                    border: '1px solid #eee'
                  }}>
                    {selectedTopic.main_objective || 'Sin descripción'}
                  </Box>
                ) : (
                  <textarea
                    style={{
                      width: '100%',
                      minHeight: 120,
                      resize: 'vertical',
                      fontSize: '1rem',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontFamily: 'inherit'
                    }}
                    value={mainObjectiveValue}
                    onChange={e => setMainObjectiveValue(e.target.value)}
                    placeholder="Define aquí el objetivo principal para este asunto de materialidad..."
                  />
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Selecciona un asunto de materialidad para definir su objetivo principal
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainObjective; 