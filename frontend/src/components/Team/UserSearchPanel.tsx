import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  InputAdornment,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Typography,
  alpha
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { useState, useEffect, ChangeEvent } from 'react';
import { searchAvailableUsers, User, TeamMember } from '@/services/teamService';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  // Efecto para actualizar la lista de usuarios cuando cambien los miembros del equipo
  useEffect(() => {
    if (users.length > 0) {
      // Si hay usuarios cargados, los filtramos de nuevo
      const filteredUsers = users.filter(user => {
        const isTeamMember = teamMembers.some(member => member.user_id === parseInt(user.id));
        if (isTeamMember) return false;

        if (filters.name && !user.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.surname && !user.surname.toLowerCase().includes(filters.surname.toLowerCase())) return false;
        if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
        return true;
      });
      setUsers(filteredUsers);
    }
  }, [teamMembers]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams: any = {
        page: 1,
        per_page: 1000
      };

      if (searchTerm) {
        searchParams.search_term = searchTerm;
      }
      if (filters.name) {
        searchParams.name = filters.name;
      }
      if (filters.surname) {
        searchParams.surname = filters.surname;
      }
      if (filters.email) {
        searchParams.email = filters.email;
      }

      const response = await searchAvailableUsers(searchParams);
      // Filtrar usuarios que ya son miembros del equipo
      const availableUsers = response.items.filter(user => 
        !teamMembers.some(member => member.user_id === parseInt(user.id))
      );
      setUsers(availableUsers);
      
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar usuarios. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setUsers([]);
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

  const filteredUsers = users.filter(user => {
    const isTeamMember = teamMembers.some(member => member.user_id === parseInt(user.id));
    if (isTeamMember) return false;

    if (filters.name && !user.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.surname && !user.surname.toLowerCase().includes(filters.surname.toLowerCase())) return false;
    if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
    return true;
  });

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

        {!isLoading && !error && users.length === 0 && searchTerm && (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
            No se encontraron usuarios que coincidan con la búsqueda.
          </Typography>
        )}

        <UserList 
          users={filteredUsers} 
          isLoading={isLoading}
          onUserSelect={handleUserSelect}
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
      </Box>
    </DndProvider>
  );
};

export default UserSearchPanel; 