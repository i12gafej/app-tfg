import { useState, ChangeEvent } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/useAuth';
import { surveyService, type PrivateSurvey, type PrivateSurveySearch } from '@/services/surveyService';
import SurveyComplete from './SurveyComplete';

interface SurveySearchProps {
  onSearch?: (searchTerm: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  resource_name?: string;
  year?: string;
}

const SurveySearch = ({ onSearch }: SurveySearchProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    resource_name: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<PrivateSurvey[]>([]);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const { token } = useAuth();
  const [selectedSurvey, setSelectedSurvey] = useState<PrivateSurvey | null>(null);

  const handleSearch = async (newPage: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: PrivateSurveySearch = {
        page: newPage,
        per_page: perPage
      };

      if (searchTerm) {
        searchParams.search_term = searchTerm;
      }
      if (filters.resource_name) {
        searchParams.heritage_resource_name = filters.resource_name;
      }
      if (filters.year) {
        searchParams.year = filters.year;
      }

      const response = await surveyService.searchPrivateSurveys(searchParams, token || '');
      setSurveys(response.items);
      setTotalSurveys(response.total);
      setPage(response.page);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar encuestas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSurveys([]);
    setTotalSurveys(0);
  };

  const handleParticipate = (survey: PrivateSurvey) => {
    setSelectedSurvey(survey);
  };

  const handleSurveyComplete = () => {
    setSelectedSurvey(null);
    handleSearch(page);
  };

  if (selectedSurvey) {
    return (
      <Box>
        <Button
          variant="outlined"
          onClick={() => setSelectedSurvey(null)}
          sx={{ mb: 2 }}
        >
          Volver a la búsqueda
        </Button>
        <SurveyComplete
          reportId={selectedSurvey.id}
          scale={5} // TODO: Obtener scale del reporte
          onComplete={handleSurveyComplete}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Paper 
        sx={{ 
          p: 0, 
          mb: 2,
          borderRadius: '100px',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: '0 1px 6px 0 rgba(32, 33, 36, 0.28)',
            borderColor: 'transparent'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          p: 1,
          height: '50px'
        }}>
          <IconButton 
            onClick={() => handleSearch(1)}
            sx={{ 
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <SearchIcon />
          </IconButton>
          
          <TextField
            fullWidth
            variant="standard"
            placeholder="Buscar por recurso patrimonial o año..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                handleSearch(1);
              }
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                paddingY: 0,
                '& input': {
                  padding: 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                },
              },
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                marginBottom: -2.5,
              },
            }}
          />

          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              color: showFilters ? 'primary.main' : 'inherit',
              transform: showFilters ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Paper>

      {showFilters && (
        <Paper 
          sx={{ 
            p: 3,
            borderRadius: 2,
            boxShadow: '0 1px 6px 0 rgba(32, 33, 36, 0.28)',
            mb: 3
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recurso Patrimonial"
                value={filters.resource_name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('resource_name', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Año de la Memoria"
                value={filters.year || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('year', e.target.value)}
                variant="outlined"
                size="small"
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => handleSearch(1)}
                  startIcon={<SearchIcon />}
                  size="small"
                >
                  Buscar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && surveys.length > 0 && (
        <Grid container spacing={3}>
          {surveys.map((survey) => (
            <Grid item xs={12} sm={6} md={4} key={survey.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {survey.heritage_resource_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Año: {survey.year}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleParticipate(survey)}
                  >
                    Participar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !error && surveys.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron encuestas que coincidan con la búsqueda.
        </Typography>
      )}
    </Box>
  );
};

export default SurveySearch;
