import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  OutlinedInput,
  useTheme
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { odsService, ODS, getBackgroundColor, getDimension } from '@/services/odsService';
import { goalsService, Goal } from '@/services/goalsService';
import { materialTopicService, sortMaterialTopics } from '@/services/materialTopicService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface MaterialTopic {
  id: number;
  name: string;
  goal_ods_id?: number | null;
  goal_number?: string | null;
  report_id: number;
}

interface MainSecondaryImpactsProps {
  reportId: number;
  onUpdate: () => void;
  readOnly?: boolean;
}

const MainSecondaryImpacts: React.FC<MainSecondaryImpactsProps> = ({
  reportId,
  onUpdate,
  readOnly = false
}) => {
  console.log('Valor de readOnly en MainSecondaryImpacts:', readOnly);
  const { token } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [odsList, setOdsList] = useState<ODS[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [secondaryImpacts, setSecondaryImpacts] = useState<{ [key: number]: number[] }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [changes, setChanges] = useState<{ [key: number]: boolean }>({});


  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        
        // Cargar ODS
        const odsResponse = await odsService.getAllODS(token);
        setOdsList(odsResponse.items);

        // Cargar Goals
        const goalsResponse = await goalsService.getAllGoals(token);
        setGoals(goalsResponse.items);

        // Cargar Material Topics
        const materialTopicsResponse = await materialTopicService.getAllByReport(reportId, token);
        // Ordenar los asuntos materiales con la función común
        setMaterialTopics(sortMaterialTopics<MaterialTopic>(materialTopicsResponse || []));

        // Cargar impactos secundarios para cada asunto de materialidad
        const secondaryImpactsData: { [key: number]: number[] } = {};
        for (const topic of materialTopicsResponse || []) {
          const response = await odsService.getSecondaryImpacts(topic.id, token);
          secondaryImpactsData[topic.id] = response.ods_ids;
        }
        setSecondaryImpacts(secondaryImpactsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMaterialTopics([]);
        setOdsList([]);
        setGoals([]);
        setSecondaryImpacts({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, reportId]);

  const handleMainImpactChange = async (topicId: number, odsId: number | '') => {
    if (readOnly) return;
    const topic = materialTopics.find(t => t.id === topicId);
    if (!topic) return;

    // Si se deselecciona el ODS, limpiar todo
    if (odsId === '') {
      const updatedTopics = materialTopics.map(t => 
        t.id === topicId ? { ...t, goal_ods_id: undefined, goal_number: undefined } : t
      );
      setMaterialTopics(updatedTopics);
      setSecondaryImpacts(prev => ({ ...prev, [topicId]: [] }));
      return;
    }

    // Actualizar el ODS seleccionado
    const updatedTopics = materialTopics.map(t => 
      t.id === topicId ? { ...t, goal_ods_id: odsId as number, goal_number: undefined } : t
    );
    setMaterialTopics(updatedTopics);
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleGoalChange = (topicId: number, goalNumber: string | '') => {
    if (readOnly) return;
    const topic = materialTopics.find(t => t.id === topicId);
    if (!topic) return;

    // Actualizar la meta seleccionada
    const updatedTopics = materialTopics.map(t => 
      t.id === topicId ? { ...t, goal_number: goalNumber || undefined } : t
    );
    setMaterialTopics(updatedTopics);
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleSecondaryImpactChange = (topicId: number, selectedOdsIds: number[]) => {
    if (readOnly) return;
    setSecondaryImpacts(prev => ({ ...prev, [topicId]: selectedOdsIds }));
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleSaveChanges = async (topicId: number) => {
    if (!token || readOnly) return;
    try {
      setLoading(true);
      const topic = materialTopics.find(t => t.id === topicId);
      if (!topic) return;

      // Si no hay ODS principal ni meta, actualizar el asunto para eliminarlos en el backend
      if (!topic.goal_ods_id && !topic.goal_number) {
        await materialTopicService.updateMaterialTopic(topicId, {
          goal_ods_id: null,
          goal_number: null
        }, token);
      } else if (topic.goal_ods_id && topic.goal_number) {
        // Actualizar impacto principal normalmente
        await goalsService.updateMainImpact({
          material_topic_id: topicId,
          goal_ods_id: topic.goal_ods_id,
          goal_number: topic.goal_number
        }, token);
      }

      // Actualizar impactos secundarios
      await odsService.updateSecondaryImpacts(
        topicId,
        secondaryImpacts[topicId] || [],
        token
      );

      setChanges(prev => ({ ...prev, [topicId]: false }));
      onUpdate();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = materialTopics.filter(topic =>
    topic.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        Impactos Principal y Secundario de los ODS
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Buscar asunto de materialidad"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="15%">Dimensión</TableCell>
                <TableCell width="20%">Asunto de Materialidad</TableCell>
                <TableCell width="25%">Impacto Principal ODS</TableCell>
                <TableCell width="30%">Impactos Secundarios ODS</TableCell>
                <TableCell width="10%"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTopics.map((topic) => (
                <TableRow 
                  key={topic.id}
                  sx={{ 
                    backgroundColor: getBackgroundColor(topic.goal_ods_id ?? undefined),
                    '&:hover': {
                      backgroundColor: getBackgroundColor(topic.goal_ods_id ?? undefined),
                    }
                  }}
                >
                  <TableCell>
                    {getDimension(topic.goal_ods_id ?? undefined)}
                  </TableCell>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl sx={{ width: 300 }} disabled={readOnly}>
                        <InputLabel>ODS Principal</InputLabel>
                        <Select
                          value={topic.goal_ods_id ?? ''}
                          label="ODS Principal"
                          onChange={readOnly ? undefined : (e: React.ChangeEvent<{ value: unknown }>) => handleMainImpactChange(topic.id, Number(e.target.value))}
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

                      <FormControl sx={{ width: 300 }} disabled={readOnly || !topic.goal_ods_id}>
                        <InputLabel>Meta</InputLabel>
                        <Select
                          value={topic.goal_number ?? ''}
                          label="Meta"
                          onChange={readOnly ? undefined : (e: React.ChangeEvent<{ value: unknown }>) => handleGoalChange(topic.id, e.target.value as string)}
                          disabled={readOnly || !topic.goal_ods_id}
                        >
                          <MenuItem value="">
                            <em>Ninguna</em>
                          </MenuItem>
                          {goals
                            .filter(goal => goal.ods_id === (topic.goal_ods_id ?? undefined))
                            .map((goal) => (
                              <MenuItem key={goal.id} value={goal.goal_number}>
                                {goal.ods_id}.{goal.goal_number} - {goal.description}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <FormControl sx={{ width: 300 }} disabled={!topic.goal_number}>
                      <InputLabel>Impactos Secundarios</InputLabel>
                      <Select
                        multiple
                        value={secondaryImpacts[topic.id] || []}
                        input={<OutlinedInput label="Impactos Secundarios" />}
                        onChange={readOnly ? undefined : (e: React.ChangeEvent<{ value: unknown }>) => {
                          const selectedIds = (e.target.value as unknown as number[]);
                          const filteredIds = selectedIds.filter(id => id !== topic.goal_ods_id);
                          handleSecondaryImpactChange(topic.id, filteredIds);
                        }}
                        disabled={!topic.goal_number}
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
                            disabled={ods.id === (topic.goal_ods_id ?? undefined)}
                          >
                            {ods.id}. {ods.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {!readOnly && changes[topic.id] && (
                      <Tooltip title="Guardar cambios">
                        <IconButton
                          color="primary"
                          onClick={() => handleSaveChanges(topic.id)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
 
export default MainSecondaryImpacts; 