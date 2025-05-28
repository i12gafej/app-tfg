import { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  TablePagination,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/context/auth.context';
import { reportService, type SustainabilityReport, type ReportSearchParams } from '@/services/reportServices';
import { ReportCreateDialog } from './ReportCreateDialog';
import { ReportPermissionDialog } from './ReportPermissionDialog';
import TableSortLabel from '@mui/material/TableSortLabel';
import ReportDeleteDialog from './ReportDeleteDialog';
import ReportEditDialog from './ReportEditDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface ReportSearchProps {
  onSearch?: (searchTerm: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  heritage_resource_name?: string;
  year?: number;
  state?: 'Draft' | 'Published';
}

type SortField = 'heritage_resource_name' | 'year' | 'state';
type SortOrder = 'asc' | 'desc';

const ReportSearch = ({ onSearch }: ReportSearchProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    heritage_resource_name: undefined,
    year: undefined,
    state: undefined
  });
  const [reports, setReports] = useState<SustainabilityReport[]>([]);
  const [allReports, setAllReports] = useState<SustainabilityReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalReports, setTotalReports] = useState(0);
  const { token, user } = useAuth();
  const isAdmin = user?.admin || false;
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [createOpen, setCreateOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SustainabilityReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<{ id: number; resourceName: string; year: number } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<SustainabilityReport | null>(null);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: ReportSearchParams = {};

      if (searchTerm || filters.heritage_resource_name || filters.year || filters.state) {
        if (searchTerm) {
          searchParams.search_term = searchTerm;
        }
        if (filters.heritage_resource_name) {
          searchParams.heritage_resource_name = filters.heritage_resource_name;
        }
        if (filters.year) {
          searchParams.year = filters.year;
        }
        if (filters.state) {
          searchParams.state = filters.state;
        }
      }

      console.log('Parámetros de búsqueda:', searchParams);

      const response = await reportService.searchReports(searchParams, token || '');
      
      console.log('Respuesta del servidor:', response);
      
      setAllReports(response.items);
      setTotalReports(response.total);
      
      // Aplicar paginación inicial
      const start = 0;
      const end = rowsPerPage;
      const visibleReports = response.items.slice(start, end);
      setReports(visibleReports);
      
      console.log('Reportes visibles:', visibleReports);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar memorias. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para manejar la paginación cuando cambian los parámetros
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
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Resetear a la primera página cuando cambia el número de filas por página
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
    if (onSearch) {
      onSearch('', filters);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Si se hace clic en la misma columna, cambiar el orden
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Si se hace clic en una nueva columna, ordenar ascendente por defecto
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortReports = (reports: SustainabilityReport[], field: SortField, order: SortOrder): SustainabilityReport[] => {
    return [...reports].sort((a, b) => {
      let comparison = 0;
      
      if (field === 'year') {
        comparison = a.year - b.year;
      } else if (field === 'state') {
        comparison = a.state.localeCompare(b.state);
      } else if (field === 'heritage_resource_name') {
        const nameA = a.heritage_resource_name || '';
        const nameB = b.heritage_resource_name || '';
        comparison = nameA.localeCompare(nameB);
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
  };

  const handleReportCreated = (newReport: SustainabilityReport) => {
    handleSearch(); // Actualizar la lista de memorias
  };

  const handleEdit = (report: SustainabilityReport) => {
    setSelectedReportForEdit(report);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedReportForEdit(null);
  };

  const handleEditDialogSave = () => {
    handleSearch(); // Actualizar la lista después de guardar
  };

  const handleView = (report: SustainabilityReport) => {
    if (report.user_role?.role === 'external_advisor') {
      navigate(`/memorias/asesorar/${report.id}/${report.heritage_resource_name}/${report.year}`);
    } else {
      navigate(`/memorias/consultar/${report.id}/${report.heritage_resource_name}/${report.year}`);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Gestor';
      case 'consultant':
        return 'Consultor';
      case 'external_advisor':
        return 'Asesor externo';
      default:
        return role;
    }
  };

  const handleOpenPermissions = (report: SustainabilityReport) => {
    setSelectedReport(report);
    setPermissionDialogOpen(true);
  };

  const handleClosePermissions = () => {
    setPermissionDialogOpen(false);
    setSelectedReport(null);
  };

  const handleOpenDeleteDialog = (report: SustainabilityReport) => {
    setReportToDelete({
      id: report.id,
      resourceName: report.heritage_resource_name || 'Sin nombre',
      year: report.year
    });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleDeleted = () => {
    handleSearch();
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Recurso Patrimonial"
                value={filters.heritage_resource_name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('heritage_resource_name', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.state || ''}
                  label="Estado"
                  onChange={(e: SelectChangeEvent) => {
                    const value = e.target.value;
                    handleFilterChange('state', value === '' ? undefined : value as 'Draft' | 'Published');
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Draft">Borrador</MenuItem>
                  <MenuItem value="Published">Publicado</MenuItem>
                </Select>
              </FormControl>
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

        <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ 
            ml: 1,
            borderRadius: '20px',
            textTransform: 'none',
            px: 2,
            marginBottom: 1,
            }}
        >
            Nueva Memoria
      </Button>

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
        <TableContainer component={Paper} sx={{ mt: 2, position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'heritage_resource_name'}
                    direction={sortField === 'heritage_resource_name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('heritage_resource_name')}
                  >
                    Recurso Patrimonial
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'year'}
                    direction={sortField === 'year' ? sortOrder : 'asc'}
                    onClick={() => handleSort('year')}
                  >
                    Año
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'state'}
                    direction={sortField === 'state' ? sortOrder : 'asc'}
                    onClick={() => handleSort('state')}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                {!isAdmin && <TableCell>Rol</TableCell>}
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow 
                  key={report.id}
                  sx={{
                    backgroundColor: report.template ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                    '&:hover': {
                      backgroundColor: report.template 
                        ? 'rgba(25, 118, 210, 0.12)' 
                        : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {report.template && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Plantilla
                        </Typography>
                      )}
                      {report.heritage_resource_name || 'Sin nombre'}
                    </Box>
                  </TableCell>
                  <TableCell>{report.year}</TableCell>
                  <TableCell>{report.state === 'Draft' ? 'Borrador' : 'Publicado'}</TableCell>
                  {!isAdmin && (
                    <TableCell>
                      {report.user_role ? getRoleLabel(report.user_role.role) : 'Sin rol'}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 1 : 0,
                      justifyContent: 'flex-end'
                    }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth={isMobile}
                        sx={{ 
                          mr: isMobile ? 0 : 1,
                          minWidth: isMobile ? '100%' : 'auto'
                        }}
                        onClick={() => handleView(report)}
                        startIcon={<VisibilityIcon />}
                      >
                        Consultar
                      </Button>
                      {(isAdmin || report.user_role?.role === 'manager') && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="view"
                          fullWidth={isMobile}
                          onClick={() => handleEdit(report)}
                          sx={{ 
                            mr: isMobile ? 0 : 1,
                            minWidth: isMobile ? '100%' : 'auto'
                          }}
                          startIcon={<EditIcon />}
                        >
                          Editar
                        </Button>
                      )}
                      {(isAdmin || report.user_role?.role === 'manager') && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          fullWidth={isMobile}
                          sx={{ 
                            mr: isMobile ? 0 : 1,
                            minWidth: isMobile ? '100%' : 'auto'
                          }}
                          onClick={() => handleOpenDeleteDialog(report)}
                          startIcon={<DeleteOutlineIcon />}
                        >
                          Eliminar
                        </Button>
                      )}
                      {(isAdmin || report.user_role?.role === 'manager') && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="secondary"
                          fullWidth={isMobile}
                          sx={{ mr: isMobile ? 0 : 1,
                             minWidth: isMobile ? '100%' : 'auto' }}
                          onClick={() => handleOpenPermissions(report)}
                        >
                          Permisos del Asesor
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={allReports.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

      {!loading && !error && reports.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron memorias que coincidan con la búsqueda.
        </Typography>
      )}

      

      <ReportCreateDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onReportCreated={handleReportCreated}
        token={token || ''}
      />

      <ReportPermissionDialog
        open={permissionDialogOpen}
        onClose={handleClosePermissions}
        report={selectedReport as SustainabilityReport}
        token={token || ''}
      />

      <ReportDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        report={reportToDelete}
        token={token || ''}
        onDeleted={handleDeleted}
      />

      {selectedReportForEdit && (
        <ReportEditDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          reportId={selectedReportForEdit.id}
          reportName={selectedReportForEdit.heritage_resource_name || ''}
          year={selectedReportForEdit.year.toString()}
          initialObservation={selectedReportForEdit.observation}
          initialIsTemplate={selectedReportForEdit.template}
        />
      )}
    </Box>
  );
};

export default ReportSearch;
