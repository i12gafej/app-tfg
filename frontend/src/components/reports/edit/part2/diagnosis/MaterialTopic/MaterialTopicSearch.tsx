import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  InputAdornment,
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
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/useAuth';
import { materialTopicService, MaterialTopic } from '@/services/materialTopicService';
import { MaterialTopicDetailsDialog } from './MaterialTopicDetailsDialog';
import { MaterialTopicEditDialog } from './MaterialTopicEditDialog';
import { MaterialTopicDeleteDialog } from './MaterialTopicDeleteDialog';
import { MaterialTopicCreateDialog } from './MaterialTopicCreateDialog';
import { stakeholderService } from '@/services/stakeholderService';

interface MaterialTopicSearchProps {
  reportId: number;
  readOnly?: boolean;
}

type Order = 'asc' | 'desc';

const MaterialTopicSearch: React.FC<MaterialTopicSearchProps> = ({ reportId, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [materialTopics, setMaterialTopics] = useState<MaterialTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [totalMaterialTopics, setTotalMaterialTopics] = useState(0);
  const [selectedMaterialTopic, setSelectedMaterialTopic] = useState<MaterialTopic | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof MaterialTopic>('name');
  const [userRole, setUserRole] = useState<'manager' | 'consultant' | 'external_advisor' | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (token) {
        try {
          const response = await stakeholderService.getUserRole(reportId, token);
          setUserRole(response.role);
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      }
    };
    fetchUserRole();
  }, [reportId, token]);

  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  useEffect(() => {
    if (token) {
      handleSearch(0);
    }
    // eslint-disable-next-line
  }, [token, reportId]);

  const handleSearch = async (newPage: number = 0) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        page: newPage + 1,
        per_page: rowsPerPage,
        report_id: reportId,
        ...(searchTerm && { search_term: searchTerm })
      };

      const response = await materialTopicService.searchMaterialTopics(searchParams, token);
      setMaterialTopics(response.items);
      setTotalMaterialTopics(response.total);
      setPage(newPage);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar asuntos relevantes. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    handleSearch(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    handleSearch(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    handleSearch(0);
  };

  const handleView = (materialTopic: MaterialTopic) => {
    setSelectedMaterialTopic(materialTopic);
    setDetailsOpen(true);
  };

  const handleEdit = (materialTopic: MaterialTopic) => {
    setSelectedMaterialTopic(materialTopic);
    setEditOpen(true);
  };

  const handleDelete = (materialTopic: MaterialTopic) => {
    setSelectedMaterialTopic(materialTopic);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleMaterialTopicCreated = () => {
    handleSearch(page);
  };

  const handleRequestSort = (property: keyof MaterialTopic) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedMaterialTopics = React.useMemo(() => {
    return [...materialTopics].sort((a, b) => {
      if (orderBy === 'name') {
        return order === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [materialTopics, order, orderBy]);

  const canEdit = (user?.admin || userRole === 'manager') && !readOnly;

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
            onClick={() => handleSearch(page)}
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
            placeholder="Buscar asuntos relevantes..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                handleSearch(0);
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
        </Box>
      </Paper>

      {canEdit && (
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
        Nuevo Asunto Relevante
      </Button>
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

      {materialTopics.length > 0 && (
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
                <TableCell>ODS</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedMaterialTopics.map((materialTopic) => (
                <TableRow key={materialTopic.id}>
                  <TableCell>{materialTopic.name}</TableCell>
                  <TableCell>
                    {materialTopic.goal_ods_id && materialTopic.goal_number 
                      ? `${materialTopic.goal_ods_id}.${materialTopic.goal_number}`
                      : '-'}
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
                        onClick={() => handleView(materialTopic)}
                      >
                        Consultar
                      </Button>
                      {canEdit && (
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
                        onClick={() => handleEdit(materialTopic)}
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
                        onClick={() => handleDelete(materialTopic)}
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
            count={totalMaterialTopics}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Asuntos por página:"
            labelDisplayedRows={({ from, to, count }: { from: number, to: number, count: number }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

      {!loading && !error && materialTopics.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron asuntos relevantes que coincidan con la búsqueda.
        </Typography>
      )}

      {selectedMaterialTopic && (
        <>
          <MaterialTopicDetailsDialog
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            materialTopic={selectedMaterialTopic}
            onEdit={canEdit ? () => handleEdit(selectedMaterialTopic) : undefined}
          />
          {canEdit && (
            <>
          <MaterialTopicEditDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            materialTopic={selectedMaterialTopic}
            token={token || ''}
            onUpdate={() => handleSearch(page)}
          />
          <MaterialTopicDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            materialTopic={selectedMaterialTopic}
            token={token || ''}
            onDelete={() => handleSearch(page)}
          />
            </>
          )}
        </>
      )}

      {canEdit && (
      <MaterialTopicCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onMaterialTopicCreated={handleMaterialTopicCreated}
        token={token || ''}
        reportId={reportId}
      />
      )}
    </Box>
  );
};

export default MaterialTopicSearch;
