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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { useReport } from '@/context/ReportContext';
import { reportService, ReportBibliography } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';

// Diálogo de consulta
const ViewDialog = ({ open, onClose, bibliography }: { open: boolean; onClose: () => void; bibliography: ReportBibliography }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Consultar Referencia</DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
        {bibliography.reference}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

// Diálogo de edición
const EditDialog = ({
  open,
  onClose,
  bibliography,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  bibliography: ReportBibliography;
  onSave: (bibliography: ReportBibliography) => void;
}) => {
  const [text, setText] = useState(bibliography.reference);

  useEffect(() => {
    setText(bibliography.reference);
  }, [bibliography]);

  const handleSave = () => {
    onSave({ ...bibliography, reference: text });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Referencia</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto de la referencia"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={!text.trim()}>Guardar</Button>
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
  onSave: (bibliography: Omit<ReportBibliography, 'id'>) => void;
}) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    onSave({ reference: text, report_id: 0 });
    setText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Referencia</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto de la referencia"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={!text.trim()}>Guardar</Button>
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
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirmar eliminación</DialogTitle>
    <DialogContent>
      <Typography>¿Estás seguro de que deseas eliminar esta referencia?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);

const Bibliography = () => {
  const { report, loading: reportLoading, readOnly } = useReport();
  const { token } = useAuth();
  const [bibliographies, setBibliographies] = useState<ReportBibliography[]>([]);
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
  const [selectedBibliography, setSelectedBibliography] = useState<ReportBibliography | null>(null);

  // Cargar referencias iniciales
  useEffect(() => {
    const loadBibliographies = async () => {
      if (!report?.id || !token) return;
      try {
        setLoading(true);
        const bibliographies = await reportService.getReportBibliographies(report.id, token);
        setBibliographies(bibliographies);
      } catch (err) {
        console.error('Error al cargar las referencias:', err);
        setError('Error al cargar las referencias. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    loadBibliographies();
  }, [report?.id, token]);

  // Filtrar referencias según el término de búsqueda
  const filteredBibliographies = bibliographies.filter(bib =>
    bib.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginar referencias
  const paginatedBibliographies = filteredBibliographies.slice(
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
    setSelectedBibliography(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedBibliography(null);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBibliography(null);
  };

  const handleView = (bibliography: ReportBibliography) => {
    setSelectedBibliography(bibliography);
    setViewDialogOpen(true);
  };

  const handleEdit = (bibliography: ReportBibliography) => {
    setSelectedBibliography(bibliography);
    setEditDialogOpen(true);
  };

  const handleDelete = (bibliography: ReportBibliography) => {
    setSelectedBibliography(bibliography);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (updatedBibliography: ReportBibliography) => {
    if (!token || !report) return;
    try {
      setLoading(true);
      await reportService.updateBibliography(report.id, updatedBibliography.id, updatedBibliography.reference, token);
      const bibliographies = await reportService.getReportBibliographies(report.id, token);
      setBibliographies(bibliographies);
      setSuccessMessage('Referencia actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar la referencia:', err);
      setError('Error al actualizar la referencia');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newBibliography: Omit<ReportBibliography, 'id'>) => {
    if (!token || !report) return;
    try {
      setLoading(true);
      await reportService.createBibliography(report.id, newBibliography.reference, token);
      const bibliographies = await reportService.getReportBibliographies(report.id, token);
      setBibliographies(bibliographies);
      setSuccessMessage('Referencia creada correctamente');
    } catch (err) {
      console.error('Error al crear la referencia:', err);
      setError('Error al crear la referencia');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !selectedBibliography) return;
    try {
      setLoading(true);
      await reportService.deleteBibliography(selectedBibliography.id, token);
      const bibliographies = await reportService.getReportBibliographies(report?.id || 0, token);
      setBibliographies(bibliographies);
      setSuccessMessage('Referencia eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar la referencia:', err);
      setError('Error al eliminar la referencia');
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
          Referencias Bibliográficas
        </Typography>
        {!readOnly && (
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setCreateDialogOpen(true)}
            variant="contained"
            disabled={reportLoading}
          >
            Añadir referencia
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar referencias..."
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
              <TableCell>Referencia</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedBibliographies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No se encontraron referencias
                </TableCell>
              </TableRow>
            ) : (
              paginatedBibliographies.map((bibliography) => (
                <TableRow key={bibliography.id}>
                  <TableCell sx={{ maxWidth: '700px', whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bibliography.reference}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleView(bibliography)} sx={{ color: 'grey.600' }}>
                      <VisibilityIcon />
                    </IconButton>
                    {!readOnly && (
                      <>
                        <IconButton onClick={() => handleEdit(bibliography)} sx={{ color: 'grey.600' }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(bibliography)} sx={{ color: 'grey.600' }}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredBibliographies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {selectedBibliography && (
        <>
          <ViewDialog
            open={viewDialogOpen}
            onClose={handleCloseViewDialog}
            bibliography={selectedBibliography}
          />
          <EditDialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            bibliography={selectedBibliography}
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

export default Bibliography; 