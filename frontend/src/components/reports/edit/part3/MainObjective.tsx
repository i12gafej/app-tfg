import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Grid, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import EditorMenuBar from '../common/EditorMenuBar';
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
  const { report } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: selectedTopic?.main_objective || '<p>Define aquí el objetivo principal para este asunto relevante...</p>',
  });

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

  useEffect(() => {
    if (editor && selectedTopic) {
      editor.commands.setContent(selectedTopic.main_objective || '<p>Define aquí el objetivo principal para este asunto relevante...</p>');
    }
  }, [selectedTopic, editor]);

  const handlePriorityChange = (event: any) => {
    if (!selectedTopic) return;
    setSelectedTopic({ ...selectedTopic, priority: event.target.value as PriorityLevel });
  };

  const handleSave = async () => {
    if (!editor || !selectedTopic) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const content = editor.getHTML();
      const updatedTopic = await materialTopicService.updateMaterialTopic(
        selectedTopic.id,
        { main_objective: content, priority: selectedTopic.priority as PriorityLevel },
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
        {/* Panel de Asuntos Relevantes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Asuntos Relevantes
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
                {selectedTopic && (
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
                minHeight: 0
              }}>
                <EditorMenuBar editor={editor} />
                <Box sx={{ 
                  padding: '1rem',
                  flex: 1,
                  minHeight: 0,
                  maxHeight: 220,
                  overflow: 'auto',
                  '& .ProseMirror': {
                    outline: 'none',
                    height: '100%'
                  }
                }}>
                  <EditorContent editor={editor} />
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Selecciona un asunto relevante para definir su objetivo principal
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainObjective; 