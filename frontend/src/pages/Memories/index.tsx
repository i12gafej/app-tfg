import { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageContainer from '../../components/layout/PageContainer';

interface Memory {
  id: string;
  title: string;
  year: number;
  description: string;
}

const Memories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [memories] = useState<Memory[]>([
    {
      id: '1',
      title: 'Memoria de Sostenibilidad 2023',
      year: 2023,
      description: 'Informe anual sobre el desempeño en sostenibilidad...'
    },
    // Más memorias de ejemplo
  ]);

  return (
    <PageContainer whiteBackground>
      <Typography variant="h4" component="h1" gutterBottom>
        Memorias de Sostenibilidad
      </Typography>
      
      {/* Buscador - CU-1.2.1 */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Buscar memorias"
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

      {/* Lista de Memorias - CU-1.2.2 */}
      <Grid container spacing={3}>
        {memories.map((memory) => (
          <Grid item xs={12} sm={6} md={4} key={memory.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {memory.title}
                </Typography>
                <Typography color="textSecondary">
                  Año: {memory.year}
                </Typography>
                <Typography variant="body2">
                  {memory.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
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

export default Memories; 