import { useState, ChangeEvent, useEffect } from 'react';
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
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SortIcon from '@mui/icons-material/Sort';
import { useAuth } from '@/hooks/useAuth';
import { resourceService, type Resource, type ResourceSearchParams, type PaginatedResponse } from '@/services/resourceService';
import ResourceDetailsDialog from './ResourceDetailsDialog';
import ResourceEditDialog from './ResourceEditDialog';
import ResourceDeleteDialog from './ResourceDeleteDialog';
import { ResourceCreateDialog } from './ResourceCreateDialog';

interface ResourceSearchProps {
  onSearch?: (searchTerm: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  name?: string;
  ownership?: string;
  management_model?: string;
  postal_address?: string;
}

type SortField = 'name' | 'ownership' | 'management_model' | 'postal_address' | 'typology';
type SortOrder = 'asc' | 'desc';

const ResourceSearch = ({ onSearch }: ResourceSearchProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    ownership: '',
    management_model: '',
    postal_address: ''
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [totalResources, setTotalResources] = useState(0);
  const { token } = useAuth();
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [tempSortField, setTempSortField] = useState<SortField>('name');
  const [tempSortOrder, setTempSortOrder] = useState<SortOrder>('asc');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  const handleSearch = async (newPage: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: ResourceSearchParams = {
        page: newPage + 1,
        per_page: rowsPerPage
      };

      if (searchTerm) {
        searchParams.search_term = searchTerm;
      } else {
        if (filters.name) searchParams.name = filters.name;
        if (filters.ownership) searchParams.ownership = filters.ownership;
        if (filters.management_model) searchParams.management_model = filters.management_model;
        if (filters.postal_address) searchParams.postal_address = filters.postal_address;
      }

      const response = await resourceService.searchResources(searchParams, token || '');
      
      setAllResources(response.items);
      setTotalResources(response.total);
      setResources(response.items);
      setPage(newPage);
      
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar recursos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allResources.length > 0) {
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      const visibleResources = allResources.slice(start, end);
      setResources(visibleResources);
    }
  }, [page, rowsPerPage, allResources]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    handleSearch();
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    handleSearch();
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResources([]);
    if (onSearch) {
      onSearch('', filters);
    }
  };

  const handleView = (resource: Resource) => {
    setSelectedResource(resource);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedResource(null);
  };

  const handleEditFromDetails = () => {
    if (selectedResource) {
      handleEdit(selectedResource);
      handleCloseDetails();
    }
  };

  const handleEdit = (resource: Resource) => {
    setResourceToEdit(resource);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setResourceToEdit(null);
  };

  const handleSaveEdit = async (resourceData: Partial<Resource>) => {
    if (!resourceToEdit) return;
    
    try {
      await resourceService.updateResource(resourceToEdit.id, resourceData, token || '');
      handleSearch();
      handleCloseEdit();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = (resource: Resource) => {
    setResourceToDelete(resource);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setResourceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    
    try {
      await resourceService.deleteResource(resourceToDelete.id, token || '');
      handleSearch();
      handleCloseDelete();
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      setError('Error al eliminar el recurso. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
  };

  const handleResourceCreated = (newResource: Resource) => {
    handleSearch();
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortFieldChange = (field: SortField) => {
    setTempSortField(field);
    setTempSortOrder('asc');
  };

  const handleSortOrderChange = (order: SortOrder) => {
    setTempSortOrder(order);
  };

  const handleApplySort = () => {
    setSortField(tempSortField);
    setSortOrder(tempSortOrder);
    const sortedResources = sortResources(allResources, tempSortField, tempSortOrder);
    setResources(sortedResources);
    handleSortClose();
  };

  const sortResources = (resources: Resource[], field: SortField, order: SortOrder): Resource[] => {
    return [...resources].sort((a, b) => {
      let comparison = 0;
      
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'ownership') {
        comparison = (a.ownership || '').localeCompare(b.ownership || '');
      } else if (field === 'management_model') {
        comparison = (a.management_model || '').localeCompare(b.management_model || '');
      } else if (field === 'postal_address') {
        comparison = (a.postal_address || '').localeCompare(b.postal_address || '');
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };

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
            placeholder="Buscar recursos..."
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
      <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ 
              ml: 1,
              borderRadius: '20px',
              textTransform: 'none',
              px: 2
            }}
          >
            Nuevo Recurso
          </Button>

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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Nombre"
                value={filters.name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('name', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Titularidad"
                value={filters.ownership || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('ownership', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Modelo de Gestión"
                value={filters.management_model || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('management_model', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Dirección Postal"
                value={filters.postal_address || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('postal_address', e.target.value)}
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

      {resources.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2, position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px">
                  <IconButton 
                    size="small"
                    onClick={handleSortClick}
                    sx={{ 
                      color: sortAnchorEl ? 'primary.main' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <SortIcon />
                  </IconButton>
                </TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Titularidad</TableCell>
                <TableCell>Modelo de Gestión</TableCell>
                
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell></TableCell>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>{resource.ownership}</TableCell>
                  <TableCell>{resource.management_model}</TableCell>
                  
                  
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
                        onClick={() => handleView(resource)}
                      >
                        Consultar
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="view"
                        fullWidth={isMobile}
                        sx={{ 
                          mr: isMobile ? 0 : 1,
                          minWidth: isMobile ? '100%' : 'auto'
                        }}
                        onClick={() => handleEdit(resource)}
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
                        onClick={() => handleDelete(resource)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Popover
            open={Boolean(sortAnchorEl)}
            anchorEl={sortAnchorEl}
            onClose={handleSortClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Ordenar por
              </Typography>
              <List dense>
                <ListItem 
                  button 
                  onClick={() => handleSortFieldChange('name')}
                  selected={tempSortField === 'name'}
                >
                  <ListItemText primary="Nombre" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleSortFieldChange('ownership')}
                  selected={tempSortField === 'ownership'}
                >
                  <ListItemText primary="Titularidad" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleSortFieldChange('management_model')}
                  selected={tempSortField === 'management_model'}
                >
                  <ListItemText primary="Modelo de Gestión" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleSortFieldChange('postal_address')}
                  selected={tempSortField === 'postal_address'}
                >
                  <ListItemText primary="Dirección Postal" />
                </ListItem>
              </List>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Orden
              </Typography>
              <List dense>
                <ListItem 
                  button 
                  onClick={() => handleSortOrderChange('asc')}
                  selected={tempSortOrder === 'asc'}
                >
                  <ListItemText primary="Ascendente" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleSortOrderChange('desc')}
                  selected={tempSortOrder === 'desc'}
                >
                  <ListItemText primary="Descendente" />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleApplySort}
                  size="small"
                >
                  Ordenar
                </Button>
              </Box>
            </Box>
          </Popover>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalResources}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

      {!loading && !error && resources.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron recursos que coincidan con la búsqueda.
        </Typography>
      )}

      <ResourceDetailsDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        onEdit={handleEditFromDetails}
        resource={selectedResource}
      />

      <ResourceEditDialog
        open={editOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        resource={resourceToEdit}
      />

      <ResourceDeleteDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        resource={resourceToDelete}
      />

      <ResourceCreateDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onResourceCreated={handleResourceCreated}
        token={token || ''}
      />
    </Box>
  );
};

export default ResourceSearch; 