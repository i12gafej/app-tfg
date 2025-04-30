import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Rating,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { materialTopicService, MaterialTopic } from '@/services/materialTopicService';
import { odsService, Dimension } from '@/services/odsService';
import { surveyService } from '@/services/surveyService';
import { stakeholderService, Stakeholder } from '@/services/stakeholderService';

interface SurveyCompleteProps {
  reportId: number;
  scale: number;
  onComplete?: () => void;
}

const dimensions = [
  { name: 'Persona', description: 'ODS relacionados con las personas y su bienestar' },
  { name: 'Planeta', description: 'ODS relacionados con la protección del planeta' },
  { name: 'Prosperidad', description: 'ODS relacionados con la prosperidad económica' },
  { name: 'Paz', description: 'ODS relacionados con la paz y la justicia' },
  { name: 'Alianzas', description: 'ODS relacionados con las alianzas para lograr los objetivos' }
];

const SurveyComplete = ({ reportId, scale, onComplete }: SurveyCompleteProps) => {
  const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [dimensionsData, setDimensionsData] = useState<Dimension[]>([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState<number | ''>('');
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar asuntos relevantes
        const topics = await materialTopicService.getAllByReport(reportId, token || '');
        setMaterialTopics(topics);

        // Cargar dimensiones
        const dimensionsResponse = await odsService.getAllDimensions(token || '');
        setDimensionsData(dimensionsResponse.dimensions);

        // Cargar grupos de interés
        const stakeholdersResponse = await stakeholderService.searchStakeholders({
          report_id: reportId,
          per_page: 100
        }, token || '');
        setStakeholders(stakeholdersResponse.items);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [reportId, token]);

  const handleStakeholderChange = (event: any) => {
    setSelectedStakeholder(event.target.value);
  };

  const handleRatingChange = (topicId: number, value: number) => {
    setRatings(prev => ({
      ...prev,
      [topicId]: value
    }));
  };

  const isStepComplete = () => {
    const currentDimension = dimensions[activeStep];
    const topicsInDimension = materialTopics.filter(topic => {
      const ods = dimensionsData.find(d => d.name === currentDimension.name)?.ods || [];
      return ods.some(o => o.id === topic.goal_ods_id);
    });

    return topicsInDimension.every(topic => ratings[topic.id] !== undefined);
  };

  const handleNext = () => {
    if (activeStep === dimensions.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const assessments = Object.entries(ratings).map(([topicId, score]) => ({
        material_topic_id: parseInt(topicId),
        score: score
      }));

      await surveyService.createAssessments({
        stakeholder_id: selectedStakeholder as number,
        assessments,
        report_id: reportId
      }, token || '');

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error al enviar valoraciones:', err);
      setError('Error al enviar las valoraciones. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const currentDimension = dimensions[activeStep];
  const topicsInDimension = materialTopics.filter(topic => {
    const ods = dimensionsData.find(d => d.name === currentDimension.name)?.ods || [];
    return ods.some(o => o.id === topic.goal_ods_id);
  });

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {dimensions.map((dimension) => (
          <Step key={dimension.name}>
            <StepLabel>{dimension.name}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && !selectedStakeholder && (
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Grupo de Interés</InputLabel>
          <Select
            value={selectedStakeholder}
            label="Grupo de Interés"
            onChange={handleStakeholderChange}
          >
            {stakeholders.map((stakeholder) => (
              <MenuItem key={stakeholder.id} value={stakeholder.id}>
                {stakeholder.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedStakeholder && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              {currentDimension.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {currentDimension.description}
            </Typography>
          </Paper>

          {topicsInDimension.map((topic) => (
            <Card key={topic.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {topic.name}
                </Typography>
                {topic.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {topic.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography component="legend">Valoración:</Typography>
                  <Rating
                    value={ratings[topic.id] || 0}
                    onChange={(event: React.SyntheticEvent, value: number | null) => handleRatingChange(topic.id, value || 0)}
                    max={scale}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepComplete()}
            >
              {activeStep === dimensions.length - 1 ? 'Enviar Formulario' : 'Siguiente'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SurveyComplete;
