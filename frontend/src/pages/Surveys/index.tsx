import { useState } from 'react';
import { Typography, Box, TextField, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageContainer from '../../components/layout/PageContainer';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  deadline?: string;
}

const Surveys = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [surveys] = useState<Survey[]>([
    {
      id: '1',
      title: 'Encuesta de Sostenibilidad 2024',
      description: 'Evaluación del impacto ambiental y social de las actividades...',
      status: 'active',
      deadline: '2024-06-30'
    },
    // Más encuestas de ejemplo se pueden añadir aquí
  ]);

  return (
    <PageContainer whiteBackground>
      <Typography variant="h4" component="h1" gutterBottom>
        Encuestas de Sostenibilidad
      </Typography>
      
      {/* Buscador */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Buscar encuestas"
              variant="outlined"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => {/* Implementar búsqueda */}}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Lista de Encuestas */}
      <Grid container spacing={3}>
        {surveys.map((survey) => (
          <Grid item xs={12} sm={6} md={4} key={survey.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {survey.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: survey.status === 'active' ? 'success.main' : 'text.secondary',
                    display: 'block',
                    mb: 1
                  }}
                >
                  Estado: {survey.status === 'active' ? 'Activa' : 'Completada'}
                </Typography>
                {survey.deadline && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Fecha límite: {new Date(survey.deadline).toLocaleDateString()}
                  </Typography>
                )}
                <Typography variant="body2">
                  {survey.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Participar
                </Button>
                <Button size="small" color="secondary">
                  Ver Detalles
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  );
};

export default Surveys; 