import { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
  Rating
} from '@mui/material';
import { useAuth } from '@/context/auth.context';
import { materialTopicService, MaterialTopic } from '@/services/materialTopicService';
import { odsService, Dimension, DIMENSION_COLORS } from '@/services/odsService';
import { surveyService } from '@/services/surveyService';
import { stakeholderService, Stakeholder } from '@/services/stakeholderService';
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import Check from '@mui/icons-material/Check';

interface SurveyCompleteProps {
  reportId: number;
  scale: number;
  onComplete?: () => void;
}

const dimensions = [
  { name: 'Persona', description: 'ODS relacionados con las personas y su bienestar', color: "#6064a4" },
  { name: 'Planeta', description: 'ODS relacionados con la protección del planeta', color: "#089c44" },
  { name: 'Prosperidad', description: 'ODS relacionados con la prosperidad económica', color: "#e89434" },
  { name: 'Paz', description: 'ODS relacionados con la paz y la justicia', color: "#089cd4" },
  { name: 'Alianzas', description: 'ODS relacionados con las alianzas para lograr los objetivos', color: "#c0448c" }
];


const CustomStepIcon = (props: any) => {
  const { active, completed, className, icon } = props;
  const stepIndex = Number(icon) - 1;
  const color = dimensions[stepIndex]?.color || '#1976d2';

  return (
    <span className={className} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: color,
      borderRadius: '50%',
      width: 32,
      height: 32,
      color: active || completed ? '#000' : '#FFF',
      fontWeight: 600,
      fontSize: 18,
    }}>
      {completed ? <Check fontSize="small" /> : icon}
    </span>
  );
};

const SurveyComplete = ({ reportId, scale, onComplete }: SurveyCompleteProps) => {
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const topRef = useRef<HTMLDivElement>(null);
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

        
        const topics = await materialTopicService.getAllByReport(reportId, token || '');
        setMaterialTopics(topics);

        
        const dimensionsResponse = await odsService.getAllDimensions(token || '');
        setDimensionsData(dimensionsResponse.dimensions);

        
        const stakeholdersResponse = await stakeholderService.searchStakeholders({
          report_id: reportId,
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
      setTimeout(() => {
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
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
        report_id: reportId,
        scale: scale
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
    <Box ref={topRef}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} orientation={isMobile ? 'vertical' : 'horizontal'}>
        {dimensions.map((dimension, idx) => (
          <Step key={dimension.name}>
            <StepLabel
              StepIconComponent={CustomStepIcon}
            >
              {dimension.name}
            </StepLabel>
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
                    icon={<CircleIcon fontSize="small" />}
                    emptyIcon={<CircleOutlinedIcon fontSize="small" />}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: currentDimension.color,
                        border: '1px solid #000',
                        borderRadius: '100%',
                      },
                      '& .MuiRating-iconEmpty': {
                        color: 'grey.400',
                        border: '1px solid #000',
                        borderRadius: '100%',
                      },
                      '& .MuiRating-icon': {
                        marginRight: '4px',
                      },
                      '& .MuiRating-icon:last-of-type': {
                        marginRight: 0,
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({ratings[topic.id] || 0} de {scale})
                  </Typography>
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
