import React, { useState, useEffect, useMemo } from 'react';
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
  SxProps
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
import { getBackgroundColor } from '@/services/odsService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface MaterialTopicSearchProps {
  reportId: number;
  readOnly?: boolean;
}

// Orden personalizado para las dimensiones
const DIMENSION_ORDER = ['SIN_DIMENSION', 'PERSONAS', 'PLANETA', 'PROSPERIDAD', 'PAZ', 'ALIANZAS'];
function getDimensionOrder(goal_ods_id: number | undefined): string {
  if (!goal_ods_id) return 'SIN_DIMENSION';
  if (goal_ods_id >= 1 && goal_ods_id <= 5) return 'PERSONAS';
  if ([6, 12, 13, 14, 15].includes(goal_ods_id)) return 'PLANETA';
  if (goal_ods_id >= 7 && goal_ods_id <= 11) return 'PROSPERIDAD';
  if (goal_ods_id === 16) return 'PAZ';
  if (goal_ods_id === 17) return 'ALIANZAS';
  return 'SIN_DIMENSION';
}

const MaterialTopicSearch: React.FC<MaterialTopicSearchProps> = ({ reportId, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allMaterialTopics, setAllMaterialTopics] = useState<MaterialTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedMaterialTopic, setSelectedMaterialTopic] = useState<MaterialTopic | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
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
      const response = await materialTopicService.searchMaterialTopics({ report_id: reportId, search_term: searchTerm }, token);
      setAllMaterialTopics(response.items);
      setPage(0);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError('Error al buscar asuntos de materialidad. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar por dimensión
  const groupedByDimension = useMemo(() => {
    const groups: { [key: string]: MaterialTopic[] } = {};
    allMaterialTopics.forEach(topic => {
      const dim = getDimensionOrder(topic.goal_ods_id ?? undefined);
      if (!groups[dim]) groups[dim] = [];
      groups[dim].push(topic);
    });
    // Ordenar cada grupo por id
    Object.keys(groups).forEach(dim => {
      groups[dim].sort((a, b) => a.id - b.id);
    });
    return groups;
  }, [allMaterialTopics]);

  // Unir los grupos en el orden deseado
  const orderedTopics = useMemo(() => {
    return DIMENSION_ORDER.flatMap(dim => groupedByDimension[dim] || []);
  }, [groupedByDimension]);

  // Paginación local
  const paginatedTopics = useMemo(() => {
    const start = page * rowsPerPage;
    return orderedTopics.slice(start, start + rowsPerPage);
  }, [orderedTopics, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    handleSearch();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    handleSearch();
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
    handleSearch();
  };

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
            placeholder="Buscar asuntos de materialidad..."
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
        Nuevo Asunto de Materialidad
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

      {paginatedTopics.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTopics.map((materialTopic) => (
                <TableRow 
                  key={materialTopic.id}
                  sx={{
                    backgroundColor: getBackgroundColor(materialTopic.goal_ods_id ?? undefined),
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light' 
                        ? `${getBackgroundColor(materialTopic.goal_ods_id ?? undefined)}dd`
                        : `${getBackgroundColor(materialTopic.goal_ods_id ?? undefined)}99`
                    }
                  }}
                >
                  <TableCell>{materialTopic.name}</TableCell>
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
                          minWidth: isMobile ? '100%' : 'auto',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onClick={() => handleView(materialTopic)}
                        startIcon={<VisibilityIcon />}
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
                          minWidth: isMobile ? '100%' : 'auto',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onClick={() => handleEdit(materialTopic)}
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
                          minWidth: isMobile ? '100%' : 'auto',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onClick={() => handleDelete(materialTopic)}
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
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={orderedTopics.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Asuntos por página:"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

      {!loading && !error && orderedTopics.length === 0 && searchTerm && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No se encontraron asuntos de materialidad que coincidan con la búsqueda.
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
            onUpdate={() => handleSearch()}
          />
          <MaterialTopicDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            materialTopic={selectedMaterialTopic}
            token={token || ''}
            onDelete={() => handleSearch()}
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
