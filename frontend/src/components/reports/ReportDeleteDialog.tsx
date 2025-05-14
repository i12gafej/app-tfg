import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Alert,
  Box
} from '@mui/material';
import { reportService, SustainabilityReport } from '@/services/reportServices';

interface ReportDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  report: { id: number; resourceName: string; year: number } | null;
  token: string;
  onDeleted: () => void;
}

const ReportDeleteDialog: React.FC<ReportDeleteDialogProps> = ({ open, onClose, report, token, onDeleted }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!report) return null;

  const confirmationPhrase = `Eliminar Memoria de sostenibilidad del recurso patrimonial ${report.resourceName} - ${report.year}`;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      await reportService.deleteReport(report.id, token);
      setConfirmationText('');
      onDeleted();
      onClose();
    } catch (err) {
      setError('Error al eliminar la memoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar Memoria de Sostenibilidad</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          ¿Seguro que quieres eliminar la memoria de <b>{report.resourceName}</b> del año <b>{report.year}</b>?
        </Typography>
        <Typography color="error" sx={{ fontWeight: 'bold', mb: 2 }}>
          {confirmationPhrase}
        </Typography>
        <TextField
          label="Escribe el texto exacto para confirmar"
          value={confirmationText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmationText(e.target.value)}
          fullWidth
          autoFocus
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading || confirmationText !== confirmationPhrase}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDeleteDialog;
