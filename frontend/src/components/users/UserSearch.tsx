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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuth } from '@/context/auth.context';
import { userService, type User } from '@/services/userService';
import UserDetailsDialog from './UserDetailsDialog';
import UserEditDialog from './UserEditDialog';
import UserDeleteDialog from './UserDeleteDialog';
import { UserCreateDialog } from './UserCreateDialog';
import TableSortLabel from '@mui/material/TableSortLabel';

interface UserSearchProps {
  onSearch?: (searchTerm: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  name?: string;
  surname?: string;
  email?: string;
  is_admin?: boolean;
}

type SortField = 'name' | 'surname' | 'email' | 'admin';
type SortOrder = 'asc' | 'desc';

const UserSearch = ({ onSearch }: UserSearchProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    surname: '',
    email: '',
    is_admin: undefined
  });
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const { token } = useAuth();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => {
    setRowsPerPage(5);
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const searchParams: any = {};

      
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
      if (filters.is_admin !== undefined) {
        searchParams.is_admin = filters.is_admin;
      }

      console.log('Parámetros de búsqueda:', searchParams);
      const response = await userService.searchUsers(searchParams, token || '');
      console.log('Respuesta del servidor:', response);
      
      
      setAllUsers(response.items);
      setTotalUsers(response.total);
      setPage(0); 
      
      const start = 0;
      const end = rowsPerPage;
      setUsers(response.items.slice(start, end));
      
      console.log('Usuarios visibles:', response.items.slice(start, end));
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar usuarios. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allUsers.length > 0) {
      const sorted = sortUsers(allUsers, sortField, sortOrder);
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      setUsers(sorted.slice(start, end));
    }
  }, [page, rowsPerPage, allUsers, sortField, sortOrder]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setUsers([]);
    if (onSearch) {
      onSearch('', filters);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedUser(null);
  };

  const handleEditFromDetails = () => {
    if (selectedUser) {
      handleEdit(selectedUser);
      handleCloseDetails();
    }
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setUserToEdit(null);
  };

  const handleSaveEdit = async (userData: Partial<User>) => {
    if (!userToEdit) return;
    
    try {
      await userService.updateUser(userToEdit.id, userData, token || '');
      
      handleSearch();
      handleCloseEdit();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.deleteUser(userToDelete.id, token || '');
      handleSearch(); 
      handleCloseDelete();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
  };

  const handleUserCreated = (newUser: User) => {
    handleSearch(); 
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortUsers = (users: User[], field: SortField, order: SortOrder): User[] => {
    return [...users].sort((a, b) => {
      let comparison = 0;
      if (field === 'admin') {
        if (order === 'asc') {
          comparison = (a.admin ? 1 : 0) - (b.admin ? 1 : 0);
        } else {
          comparison = (b.admin ? 1 : 0) - (a.admin ? 1 : 0);
        }
      } else {
        const aValue = a[field]?.toLowerCase() || '';
        const bValue = b[field]?.toLowerCase() || '';
        if (order === 'asc') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = bValue.localeCompare(aValue);
        }
      }
      return comparison;
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
        Nuevo Usuario
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
                label="Apellidos"
                value={filters.surname || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('surname', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Correo electrónico"
                value={filters.email || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('email', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={filters.is_admin === undefined ? '' : String(filters.is_admin)}
                  label="Rol"
                  onChange={(e: ChangeEvent<{ value: unknown }>) => {
                    const value = e.target.value;
                    handleFilterChange('is_admin', value === '' ? undefined : value === 'true');
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Administrador</MenuItem>
                  <MenuItem value="false">Usuario</MenuItem>
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

      {users.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2, position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'surname'}
                    direction={sortField === 'surname' ? sortOrder : 'asc'}
                    onClick={() => handleSort('surname')}
                  >
                    Apellidos
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'email'}
                    direction={sortField === 'email' ? sortOrder : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Correo
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'admin'}
                    direction={sortField === 'admin' ? sortOrder : 'asc'}
                    onClick={() => handleSort('admin')}
                  >
                    Rol
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.surname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.admin ? 'Administrador' : 'Usuario'}</TableCell>
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
                        onClick={() => handleView(user)}
                        startIcon={<VisibilityIcon />}
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
                        onClick={() => handleEdit(user)}
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
                        onClick={() => handleDelete(user)}
                        startIcon={<DeleteOutlineIcon />}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Usuarios por página:"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
            ActionsComponent={({ onPageChange, page, count, rowsPerPage }: { 
              onPageChange: (event: unknown, page: number) => void; 
              page: number; 
              count: number; 
              rowsPerPage: number;
            }) => (
              <Box sx={{ flexShrink: 0, ml: 2.5 }}>
                <IconButton
                  onClick={() => onPageChange(null, page - 1)}
                  disabled={page === 0}
                  aria-label="página anterior"
                >
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton
                  onClick={() => onPageChange(null, page + 1)}
                  disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                  aria-label="página siguiente"
                >
                  <KeyboardArrowRight />
                </IconButton>
              </Box>
            )}
          />
        </TableContainer>
      )}

      {!loading && !error && users.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron usuarios que coincidan con la búsqueda.
        </Typography>
      )}

      <UserDetailsDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        onEdit={handleEditFromDetails}
        user={selectedUser}
      />

      <UserEditDialog
        open={editOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        user={userToEdit}
      />

      <UserDeleteDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
      />
      <UserCreateDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onUserCreated={handleUserCreated}
        token={token || ''}
      />
    </Box>
  );
};

export default UserSearch; 