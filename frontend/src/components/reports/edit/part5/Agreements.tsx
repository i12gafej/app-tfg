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
import SearchIcon from '@mui/icons-material/Search';
import { useReport } from '@/context/ReportContext';
import { reportService, ReportAgreement } from '@/services/reportServices';
import { useAuth } from '@/context/auth.context';


const EditDialog = ({
  open,
  onClose,
  agreement,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  agreement: ReportAgreement;
  onSave: (agreement: ReportAgreement) => void;
}) => {
  const [text, setText] = useState(agreement.agreement);

  useEffect(() => {
    setText(agreement.agreement);
  }, [agreement]);

  const handleSave = () => {
    onSave({ ...agreement, agreement: text });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Convenio</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto del Convenio"
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


const CreateDialog = ({
  open,
  onClose,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  onSave: (agreement: Omit<ReportAgreement, 'id'>) => void;
}) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    onSave({ agreement: text, report_id: 0 });
    setText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Convenio</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto del Convenio"
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
      <Typography>¿Estás seguro de que deseas eliminar este Convenio?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);

const Agreements = () => {
  const { report, loading: reportLoading, readOnly } = useReport();
  const { token } = useAuth();
  const [agreements, setAgreements] = useState<ReportAgreement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<ReportAgreement | null>(null);

  
  useEffect(() => {
    const loadAgreements = async () => {
      if (!report?.id || !token) return;
      try {
        setLoading(true);
        const agreements = await reportService.getReportAgreements(report.id, token);
        setAgreements(agreements);
      } catch (err) {
        console.error('Error al cargar los Convenios:', err);
        setError('Error al cargar los Convenios. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    loadAgreements();
  }, [report?.id, token]);

  
  const filteredAgreements = agreements.filter(ag =>
    ag.agreement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const paginatedAgreements = filteredAgreements.slice(
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

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedAgreement(null);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedAgreement(null);
  };

  const handleEdit = (agreement: ReportAgreement) => {
    setSelectedAgreement(agreement);
    setEditDialogOpen(true);
  };

  const handleDelete = (agreement: ReportAgreement) => {
    setSelectedAgreement(agreement);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (updatedAgreement: ReportAgreement) => {
    if (!token || !report) return;
    try {
      setLoading(true);
      await reportService.updateAgreement(report.id, updatedAgreement.id, updatedAgreement.agreement, token);
      const agreements = await reportService.getReportAgreements(report.id, token);
      setAgreements(agreements);
      setSuccessMessage('Convenio actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar el Convenio:', err);
      setError('Error al actualizar el Convenio');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newAgreement: Omit<ReportAgreement, 'id'>) => {
    if (!token || !report) return;
    try {
      setLoading(true);
      await reportService.createAgreement(report.id, newAgreement.agreement, token);
      const agreements = await reportService.getReportAgreements(report.id, token);
      setAgreements(agreements);
      setSuccessMessage('Convenio creado correctamente');
    } catch (err) {
      console.error('Error al crear el Convenio:', err);
      setError('Error al crear el Convenio');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !selectedAgreement) return;
    try {
      setLoading(true);
      await reportService.deleteAgreement(selectedAgreement.id, token);
      const agreements = await reportService.getReportAgreements(report?.id || 0, token);
      setAgreements(agreements);
      setSuccessMessage('Convenio eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar el Convenio:', err);
      setError('Error al eliminar el Convenio');
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
          Convenios de Colaboración
        </Typography>
        {!readOnly && (
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setCreateDialogOpen(true)}
            variant="contained"
            disabled={reportLoading}
          >
            Añadir Convenio
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar Convenios..."
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
              <TableCell>Convenio</TableCell>
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
            ) : paginatedAgreements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No se encontraron Convenios
                </TableCell>
              </TableRow>
            ) : (
              paginatedAgreements.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell sx={{ maxWidth: '700px', whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {agreement.agreement}
                  </TableCell>
                  <TableCell align="right">
                    {!readOnly && (
                      <>
                        <Button onClick={() => handleEdit(agreement)} sx = {{mr: 1}} color="view" startIcon={<EditIcon />}>
                        </Button>
                        <Button onClick={() => handleDelete(agreement)} sx = {{mr: 1}} color="error" startIcon={<DeleteOutlineIcon />}>
                        </Button>
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
          count={filteredAgreements.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {selectedAgreement && (
        <>
          <EditDialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            agreement={selectedAgreement}
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

export default Agreements; 