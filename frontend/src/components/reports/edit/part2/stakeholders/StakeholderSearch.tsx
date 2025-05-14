import React, { useState, useEffect } from 'react';
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
  TableSortLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/useAuth';
import { stakeholderService, Stakeholder, StakeholderType } from '@/services/stakeholderService';
import { StakeholderDetailsDialog } from './StakeholderDetailsDialog';
import { StakeholderEditDialog } from './StakeholderEditDialog';
import { StakeholderDeleteDialog } from './StakeholderDeleteDialog';
import { StakeholderCreateDialog } from './StakeholderCreateDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface StakeholderSearchProps {
  reportId: number;
  readOnly?: boolean;
}

interface SearchFilters {
  name?: string;
  type?: StakeholderType;
}

type Order = 'asc' | 'desc';

const StakeholderSearch: React.FC<StakeholderSearchProps> = ({ reportId, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalStakeholders, setTotalStakeholders] = useState(0);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Stakeholder>('name');
  const [userRole, setUserRole] = useState<'manager' | 'consultant' | 'external_advisor' | null>(null);
  const [allStakeholders, setAllStakeholders] = useState<Stakeholder[]>([]);

  useEffect(() => {
    setRowsPerPage(5);
  }, []);

  useEffect(() => {
    // Obtener el rol del usuario para este reporte
    const fetchUserRole = async () => {
      try {
        const response = await stakeholderService.getUserRole(reportId, token || '');
        setUserRole(response.role);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    if (token) {
      fetchUserRole();
    }
  }, [reportId, token]);

  useEffect(() => {
    if (token) {
      handleSearch();
    }
    // eslint-disable-next-line
  }, [token, reportId]);

  const handleSearch = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        report_id: reportId,
        ...(searchTerm && { search_term: searchTerm }),
        ...(filters.name && { name: filters.name }),
        ...(filters.type && { type: filters.type })
      };

      const response = await stakeholderService.searchStakeholders(searchParams, token);
      setAllStakeholders(response.items);
      setTotalStakeholders(response.total);
      setPage(0);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar grupos de interés. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof Stakeholder) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedStakeholders = React.useMemo(() => {
    return [...allStakeholders].sort((a, b) => {
      if (orderBy === 'name') {
        return order === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (orderBy === 'type') {
        return order === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
  }, [allStakeholders, order, orderBy]);

  const paginatedStakeholders = React.useMemo(() => {
    const start = page * rowsPerPage;
    return sortedStakeholders.slice(start, start + rowsPerPage);
  }, [sortedStakeholders, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({});
    handleSearch();
  };

  const handleView = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setDetailsOpen(true);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setEditOpen(true);
  };

  const handleDelete = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleStakeholderCreated = () => {
    handleSearch();
  };

  const isManager = userRole === 'manager';

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
            placeholder="Buscar grupos de interés..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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

      {isManager && !readOnly && (
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
        Nuevo Grupo de Interés
      </Button>
      )}

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
                label="Nombre"
                value={filters.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('name', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filters.type || ''}
                  label="Tipo"
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('type', e.target.value as StakeholderType)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="internal">Interno</MenuItem>
                  <MenuItem value="external">Externo</MenuItem>
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

      {allStakeholders.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'type'}
                    direction={orderBy === 'type' ? order : 'asc'}
                    onClick={() => handleRequestSort('type')}
                  >
                    Tipo
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStakeholders.map((stakeholder) => (
                <TableRow key={stakeholder.id}>
                  <TableCell>{stakeholder.name}</TableCell>
                  <TableCell>
                    {stakeholder.type === 'internal' ? 'Interno' : 'Externo'}
                  </TableCell>
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
                        onClick={() => handleView(stakeholder)}
                        startIcon={<VisibilityIcon />}
                      >
                        Consultar
                      </Button>
                      {isManager && !readOnly && (
                        <>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="view"
                            fullWidth={isMobile}
                            sx={{ 
                              mr: isMobile ? 0 : 1,
                              minWidth: isMobile ? '100%' : 'auto'
                            }}
                            onClick={() => handleEdit(stakeholder)}
                            startIcon={<EditIcon />}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="error"
                            fullWidth={isMobile}
                            sx={{ 
                              minWidth: isMobile ? '100%' : 'auto'
                            }}
                            onClick={() => handleDelete(stakeholder)}
                            startIcon={<DeleteOutlineIcon />}
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalStakeholders}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Grupos por página:"
            labelDisplayedRows={({ from, to, count }: { from: number, to: number, count: number }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

      {!loading && !error && allStakeholders.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron grupos de interés que coincidan con la búsqueda.
        </Typography>
      )}

      {selectedStakeholder && (
        <>
          <StakeholderDetailsDialog
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            stakeholder={selectedStakeholder}
            onEdit={() => handleEdit(selectedStakeholder)}
          />
          {isManager && !readOnly && (
            <>
          <StakeholderEditDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            stakeholder={selectedStakeholder}
            token={token || ''}
            onUpdate={() => handleSearch()}
          />
          <StakeholderDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            stakeholder={selectedStakeholder}
            token={token || ''}
            onDelete={() => handleSearch()}
          />
            </>
          )}
        </>
      )}

      {isManager && !readOnly && (
      <StakeholderCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onStakeholderCreated={handleStakeholderCreated}
        token={token || ''}
        reportId={reportId}
      />
      )}
    </Box>
  );
};

export default StakeholderSearch;
