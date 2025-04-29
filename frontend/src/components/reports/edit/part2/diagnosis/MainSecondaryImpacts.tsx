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
  OutlinedInput
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { odsService, ODS } from '@/services/odsService';
import { goalsService, Goal } from '@/services/goalsService';
import { materialTopicService } from '@/services/materialTopicService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface MaterialTopic {
  id: number;
  name: string;
  goal_ods_id?: number;
  goal_number?: string;
  report_id: number;
}

interface MainSecondaryImpactsProps {
  reportId: number;
  onUpdate: () => void;
}

const MainSecondaryImpacts: React.FC<MainSecondaryImpactsProps> = ({
  reportId,
  onUpdate
}) => {
  const { token } = useAuth();
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
        setMaterialTopics(materialTopicsResponse);

        // Cargar impactos secundarios para cada asunto relevante
        const secondaryImpactsData: { [key: number]: number[] } = {};
        for (const topic of materialTopicsResponse) {
          const response = await odsService.getSecondaryImpacts(topic.id, token);
          secondaryImpactsData[topic.id] = response.ods_ids;
        }
        setSecondaryImpacts(secondaryImpactsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, reportId]);

  const handleMainImpactChange = (topicId: number, odsId: number) => {
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleGoalChange = (topicId: number, goalNumber: string) => {
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleSecondaryImpactChange = (topicId: number, selectedOdsIds: number[]) => {
    setSecondaryImpacts(prev => ({ ...prev, [topicId]: selectedOdsIds }));
    setChanges(prev => ({ ...prev, [topicId]: true }));
  };

  const handleSaveChanges = async (topicId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      const topic = materialTopics.find(t => t.id === topicId);
      if (!topic) return;

      // Actualizar impacto principal
      if (topic.goal_ods_id && topic.goal_number) {
        await goalsService.updateMainImpact({
          material_topic_id: topicId,
          goal_ods_id: topic.goal_ods_id,
          goal_number: topic.goal_number
        }, token);
      }

      // Actualizar impactos secundarios
      await odsService.updateSecondaryImpacts({
        material_topic_id: topicId,
        ods_ids: secondaryImpacts[topicId] || []
      }, token);

      setChanges(prev => ({ ...prev, [topicId]: false }));
      onUpdate();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = materialTopics?.filter(topic =>
    topic.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        Impactos Principal y Secundarios
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Buscar asunto relevante"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asunto Relevante</TableCell>
                <TableCell>Impacto Principal</TableCell>
                <TableCell>Impactos Secundarios</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTopics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>ODS Principal</InputLabel>
                        <Select
                          value={topic.goal_ods_id || ''}
                          label="ODS Principal"
                          onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleMainImpactChange(topic.id, e.target.value as number)}
                        >
                          {odsList.map((ods) => (
                            <MenuItem key={ods.id} value={ods.id}>
                              {ods.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Meta</InputLabel>
                        <Select
                          value={topic.goal_number || ''}
                          label="Meta"
                          onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleGoalChange(topic.id, e.target.value as string)}
                          disabled={!topic.goal_ods_id}
                        >
                          {goals
                            .filter(goal => goal.ods_id === topic.goal_ods_id)
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
                    <FormControl fullWidth>
                      <InputLabel>Impactos Secundarios</InputLabel>
                      <Select
                        multiple
                        value={secondaryImpacts[topic.id] || []}
                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                          const selectedIds = e.target.value as number[];
                          // Filtrar el ODS principal si está seleccionado
                          const filteredIds = selectedIds.filter(id => id !== topic.goal_ods_id);
                          handleSecondaryImpactChange(topic.id, filteredIds);
                        }}
                        input={<OutlinedInput label="Impactos Secundarios" />}
                        disabled={!topic.goal_ods_id}
                      >
                        {odsList.map((ods) => (
                          <MenuItem
                            key={ods.id}
                            value={ods.id}
                            disabled={ods.id === topic.goal_ods_id}
                          >
                            {ods.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {changes[topic.id] && (
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