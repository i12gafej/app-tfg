import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  InputAdornment,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Typography,
  alpha,
  TablePagination
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  DragIndicator as DragIndicatorIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { useAuth } from '@/context/auth.context';
import { teamService, User, TeamMember } from '@/services/teamService';
import UserList from '@/components/Team/UserList';
import TeamMemberAssignDialog from '@/components/Team/TeamMemberAssignDialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface UserSearchPanelProps {
  resourceId: string | null;
  reportId: string | null;
  teamMembers: TeamMember[];
}

interface Filters {
  name?: string;
  surname?: string;
  email?: string;
}

const ROLES = [
  'Asesor Externo',
  'Consultor',
  'Gestor de Sostenibilidad'
];

const UserSearchPanel = ({ 
  resourceId, 
  reportId,
  teamMembers 
}: UserSearchPanelProps) => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<'name' | 'surname' | 'email'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Buscar usuarios disponibles
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const searchParams: any = {};
      if (searchTerm) searchParams.search_term = searchTerm;
      if (filters.name) searchParams.name = filters.name;
      if (filters.surname) searchParams.surname = filters.surname;
      if (filters.email) searchParams.email = filters.email;
      const response = await teamService.searchAvailableUsers(searchParams, token || '');
      setAllUsers(response.items);
      setPage(0);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar usuarios. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler de ordenación
  const handleSort = (field: 'name' | 'surname' | 'email') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrar usuarios que NO están en ningún miembro del equipo
  const availableUsers = useMemo(() => {
    return allUsers.filter(user =>
      !teamMembers.some(member => member.user_id === parseInt(user.id))
    );
  }, [allUsers, teamMembers]);

  // Ordenar todos los usuarios disponibles antes de paginar
  const sortedUsers = useMemo(() => {
    return [...availableUsers].sort((a, b) => {
      const aValue = a[sortField]?.toLowerCase() || '';
      const bValue = b[sortField]?.toLowerCase() || '';
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [availableUsers, sortField, sortOrder]);

  // Paginar
  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, page, rowsPerPage]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setAllUsers([]);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsAssignDialogOpen(true);
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [searchTerm]);

  // Escuchar el evento de eliminación de miembro
  useEffect(() => {
    const handleTeamMemberDeleted = () => {
      handleSearch();
    };

    window.addEventListener('teamMemberDeleted', handleTeamMemberDeleted);
    return () => {
      window.removeEventListener('teamMemberDeleted', handleTeamMemberDeleted);
    };
  }, []);

  // Escuchar el evento de asignación de miembro
  useEffect(() => {
    const handleTeamMemberAssigned = () => {
      handleSearch();
    };

    window.addEventListener('teamMemberAssigned', handleTeamMemberAssigned);
    return () => {
      window.removeEventListener('teamMemberAssigned', handleTeamMemberAssigned);
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
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
              placeholder="Buscar usuarios..."
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
                  label="Nombre"
                  value={filters.name || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={filters.surname || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('surname', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  value={filters.email || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('email', e.target.value)}
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

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && availableUsers.length === 0 && searchTerm && (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
            No se encontraron usuarios que coincidan con la búsqueda.
          </Typography>
        )}

        <UserList 
          users={paginatedUsers} 
          isLoading={isLoading}
          onUserSelect={handleUserSelect}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {selectedUser && resourceId && reportId && (
          <TeamMemberAssignDialog
            open={isAssignDialogOpen}
            onClose={() => {
              setIsAssignDialogOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            resourceId={resourceId}
            reportId={reportId}
            onAssign={() => {
              setIsAssignDialogOpen(false);
              setSelectedUser(null);
              handleSearch(); // Refrescar la lista después de asignar
            }}
          />
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={availableUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage)}
          onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Usuarios por página:"
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
        />
      </Box>
    </DndProvider>
  );
};

export default UserSearchPanel; 