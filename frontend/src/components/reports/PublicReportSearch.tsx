import { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Grid, 
  Paper, 
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Button,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { reportService, type SustainabilityReport, type ReportSearchParams, type ReportListItem } from '@/services/reportServices';

interface SearchFilters {
  heritage_resource_name?: string;
  year?: number;
}

type SortField = 'heritage_resource_name' | 'year';
type SortOrder = 'asc' | 'desc';

const PublicReportSearch = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    heritage_resource_name: undefined,
    year: undefined
  });
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [allReports, setAllReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: ReportSearchParams = {
        state: 'Published' // Solo mostrar memorias publicadas
      };

      if (searchTerm) {
        searchParams.search_term = searchTerm;
      }
      if (filters.heritage_resource_name) {
        searchParams.heritage_resource_name = filters.heritage_resource_name;
      }
      if (filters.year) {
        searchParams.year = filters.year;
      }

      const response = await reportService.searchPublicReports(searchParams, '');
      
      setAllReports(response.items);
      
      // Aplicar paginación inicial
      const start = 0;
      const end = rowsPerPage;
      const visibleReports = response.items.slice(start, end);
      setReports(visibleReports);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar memorias. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allReports.length > 0) {
      const sortedReports = sortReports(allReports, sortField, sortOrder);
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      const visibleReports = sortedReports.slice(start, end);
      setReports(visibleReports);
    }
  }, [page, rowsPerPage, allReports, sortField, sortOrder]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setReports([]);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortReports = (reports: ReportListItem[], field: SortField, order: SortOrder): ReportListItem[] => {
    return [...reports].sort((a, b) => {
      let comparison = 0;
      
      if (field === 'year') {
        comparison = a.year - b.year;
      } else if (field === 'heritage_resource_name') {
        const nameA = a.resource_name || '';
        const nameB = b.resource_name || '';
        comparison = nameA.localeCompare(nameB);
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };

  const handleView = (report: ReportListItem) => {
    // Abrir el reporte en una nueva pestaña
    window.open(`http://localhost:8000/static/uploads/reports/${report.report_id}/report_${report.report_id}_preview.html`, '_blank');
  };

  return (
    <Box sx={{ pb: 5 }}>
      <Paper 
        sx={{ 
          py: 0, 
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
            onClick={handleSearch}
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
            placeholder="Buscar memorias..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                handleSearch();
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
                value={filters.heritage_resource_name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('heritage_resource_name', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Año"
                type="number"
                value={filters.year || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
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

      {reports.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.report_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {report.resource_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Año: {report.year}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleView(report)}
                    startIcon={<VisibilityIcon />}
                    fullWidth
                  >
                    Consultar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !error && reports.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron memorias que coincidan con la búsqueda.
        </Typography>
      )}
    </Box>
  );
};

export default PublicReportSearch; 