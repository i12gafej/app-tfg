import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Button,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { useReport } from '@/context/ReportContext';
import { reportService } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';
import { ReportNorm } from '@/services/reportServices';

// Función para extraer URLs del texto
const extractUrls = (text: string): string[] => {
  const lines = text.split('\n');
  const urls: string[] = [];
  let isUrlSection = false;

  for (const line of lines) {
    if (line.trim() === '') {
      isUrlSection = true;
      continue;
    }
    if (isUrlSection) {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        urls.push(urlMatch[0]);
      }
    }
  }
  return urls;
};

// Función para extraer el texto sin URLs
const extractText = (text: string): string => {
  const lines = text.split('\n');
  const textLines: string[] = [];
  
  for (const line of lines) {
    if (line.trim() === '') break;
    textLines.push(line);
  }
  
  return textLines.join('\n');
};

// Función para truncar texto
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Función para truncar URLs
const truncateUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};

// Diálogo de consulta
const ViewDialog = ({ open, onClose, norm }: { open: boolean; onClose: () => void; norm: ReportNorm }) => {
  const text = extractText(norm.norm);
  const urls = extractUrls(norm.norm);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Consultar Normativa</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {text}
        </Typography>
        {urls.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Enlaces:</Typography>
            {urls.map((url, index) => (
              <Link key={index} href={url} target="_blank" rel="noopener noreferrer" display="block" sx={{ mb: 1 }}>
                {url}
              </Link>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Diálogo de edición
const EditDialog = ({ 
  open, 
  onClose, 
  norm, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  norm: ReportNorm; 
  onSave: (norm: ReportNorm) => void;
}) => {
  const [text, setText] = useState(extractText(norm.norm));
  const [urls, setUrls] = useState<string[]>(extractUrls(norm.norm));
  const [newUrl, setNewUrl] = useState('');

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      setUrls([...urls, newUrl.trim()]);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const fullText = text + '\n\n' + urls.join('\n');
    onSave({ ...norm, norm: fullText });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Normativa</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto de la normativa"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>Enlaces:</Typography>
        {urls.map((url, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newUrls = [...urls];
                newUrls[index] = e.target.value;
                setUrls(newUrls);
              }}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => handleRemoveUrl(index)} color="error">
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            fullWidth
            label="Nueva URL"
            value={newUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUrl(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button onClick={handleAddUrl} variant="outlined">
            Añadir URL
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Diálogo de creación
const CreateDialog = ({ 
  open, 
  onClose, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSave: (norm: Omit<ReportNorm, 'id'>) => void;
}) => {
  const [text, setText] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      setUrls([...urls, newUrl.trim()]);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const fullText = text + '\n\n' + urls.join('\n');
    onSave({ norm: fullText, report_id: 0 });
    onClose();
    setText('');
    setUrls([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Crear Normativa</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto de la normativa"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>Enlaces:</Typography>
        {urls.map((url, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newUrls = [...urls];
                newUrls[index] = e.target.value;
                setUrls(newUrls);
              }}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => handleRemoveUrl(index)} color="error">
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            fullWidth
            label="Nueva URL"
            value={newUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUrl(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button onClick={handleAddUrl} variant="outlined">
            Añadir URL
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Diálogo de confirmación de eliminación
const DeleteDialog = ({ 
  open, 
  onClose, 
  onConfirm 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>¿Estás seguro de que deseas eliminar esta normativa?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Regulations = () => {
  const { report, loading: reportLoading, readOnly } = useReport();
  const { token } = useAuth();
  const [regulations, setRegulations] = useState<ReportNorm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estados para los diálogos
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNorm, setSelectedNorm] = useState<ReportNorm | null>(null);

  // Cargar normativas iniciales
  useEffect(() => {
    const loadNorms = async () => {
      if (!report?.id || !token) return;
      
      try {
        setLoading(true);
        const norms = await reportService.getReportNorms(report.id, token);
        setRegulations(norms);
      } catch (err) {
        console.error('Error al cargar las normativas:', err);
        setError('Error al cargar las normativas. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    loadNorms();
  }, [report?.id, token]);

  // Filtrar normativas según el término de búsqueda
  const filteredRegulations = regulations.filter(norm => 
    norm.norm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginar normativas
  const paginatedRegulations = filteredRegulations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedNorm(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedNorm(null);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedNorm(null);
  };

  const handleView = (norm: ReportNorm) => {
    setSelectedNorm(norm);
    setViewDialogOpen(true);
  };

  const handleEdit = (norm: ReportNorm) => {
    setSelectedNorm(norm);
    setEditDialogOpen(true);
  };

  const handleDelete = (norm: ReportNorm) => {
    setSelectedNorm(norm);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (updatedNorm: ReportNorm) => {
    if (!token || !report) return;

    try {
      setLoading(true);
      await reportService.updateNorm(report.id, updatedNorm.id, updatedNorm.norm, token);
      const norms = await reportService.getReportNorms(report.id, token);
      setRegulations(norms);
      setSuccessMessage('Normativa actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar la normativa:', err);
      setError('Error al actualizar la normativa');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newNorm: Omit<ReportNorm, 'id'>) => {
    if (!token || !report) return;

    try {
      setLoading(true);
      await reportService.createNorm(report.id, newNorm.norm, token);
      const norms = await reportService.getReportNorms(report.id, token);
      setRegulations(norms);
      setSuccessMessage('Normativa creada correctamente');
    } catch (err) {
      console.error('Error al crear la normativa:', err);
      setError('Error al crear la normativa');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !selectedNorm) return;

    try {
      setLoading(true);
      await reportService.deleteNorm(selectedNorm.id, token);
      const norms = await reportService.getReportNorms(report?.id || 0, token);
      setRegulations(norms);
      setSuccessMessage('Normativa eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar la normativa:', err);
      setError('Error al eliminar la normativa');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6">
          Normativas
        </Typography>
        {!readOnly && (
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setCreateDialogOpen(true)}
            variant="contained"
            disabled={reportLoading}
          >
            Añadir normativa
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar normativas..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Normativa</TableCell>
              <TableCell>URLs</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedRegulations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No se encontraron normativas
                </TableCell>
              </TableRow>
            ) : (
              paginatedRegulations.map((norm) => {
                const text = extractText(norm.norm);
                const urls = extractUrls(norm.norm);
                
                return (
                  <TableRow key={norm.id}>
                    <TableCell sx={{ maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {truncateText(text)}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {urls.length > 0 ? (
                        <>
                          <Link href={urls[0]} target="_blank" rel="noopener noreferrer" title={urls[0]} sx={{ display: 'inline-block', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {truncateUrl(urls[0])}
                          </Link>
                          {urls.length > 1 && ` (+${urls.length - 1})`}
                        </>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleView(norm)} sx={{ color: 'grey.600' }}>
                        <VisibilityIcon />
                      </IconButton>
                      {!readOnly && (
                        <>
                          <IconButton onClick={() => handleEdit(norm)} sx={{ color: 'grey.600' }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(norm)} sx={{ color: 'grey.600' }}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredRegulations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {selectedNorm && (
        <>
          <ViewDialog
            open={viewDialogOpen}
            onClose={handleCloseViewDialog}
            norm={selectedNorm}
          />
          <EditDialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            norm={selectedNorm}
            onSave={handleSaveEdit}
          />
          <DeleteDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}

      <CreateDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSave={handleCreate}
      />
    </Box>
  );
};

export default Regulations; 