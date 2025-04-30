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
  Button
} from '@mui/material';
import { useReport } from '@/context/ReportContext';
import { materialTopicService } from '@/services/materialTopicService';

interface MaterialTopic {
  id: number;
  name: string;
}

const SpecificObjectives = () => {
  const { report } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);

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
        console.error('Error al cargar asuntos relevantes:', error);
        setError('Error al cargar los asuntos relevantes');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialTopics();
  }, [report]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Objetivos Específicos
      </Typography>

      {/* Selector de Asunto Relevante */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Asunto Relevante</InputLabel>
          <Select
            value={selectedTopic?.id || ''}
            label="Asunto Relevante"
            onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
              const topic = materialTopics.find(t => t.id === e.target.value);
              setSelectedTopic(topic || null);
            }}
          >
            {materialTopics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Grid container spacing={2}>
        {/* Panel de Objetivos Específicos */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Objetivos Específicos
              </Typography>
              <Button variant="contained" size="small">
                Nuevo Objetivo
              </Button>
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
              <ListItem>
                <ListItemText primary="No hay objetivos específicos definidos" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Panel de Acciones */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Acciones
              </Typography>
              <Button variant="contained" size="small">
                Nueva Acción
              </Button>
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
              <ListItem>
                <ListItemText primary="No hay acciones definidas" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Panel de Indicadores de Rendimiento */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Indicadores
              </Typography>
              <Button variant="contained" size="small">
                Nuevo Indicador
              </Button>
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
              <ListItem>
                <ListItemText primary="No hay indicadores definidos" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Panel de Detalles */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalles
            </Typography>
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
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
              <Typography variant="body2" color="text.secondary">
                Selecciona un elemento para ver sus detalles
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpecificObjectives; 