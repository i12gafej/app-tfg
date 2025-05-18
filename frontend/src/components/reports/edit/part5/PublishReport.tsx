import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import PublishIcon from '@mui/icons-material/Publish';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '@/context/ReportContext';

const PublishReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { report } = useReport();

  if (!report) {
    return (
      <Alert severity="error">
        No se ha podido cargar la información del reporte
      </Alert>
    );
  }

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      setError(null);
      
      // Llamar al endpoint para generar la previsualización
      const response = await reportService.generatePreview(report.id, token || '');
      
      // Abrir el reporte en una nueva pestaña
      if (response.url) {
        window.open(response.url, '_blank');
      } else {
        throw new Error('No se recibió una URL válida para la previsualización');
      }
    } catch (err) {
      setError('Error al generar la previsualización');
      console.error('Error al previsualizar:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Actualizar el estado de la memoria a Published
      await reportService.updateReport(report.id, { state: 'Published' }, token || '');
      
      // Cerrar el diálogo y navegar a la vista de consulta
      setConfirmDialogOpen(false);
      navigate(`/memorias/consultar/${report.id}/${report.heritage_resource_name}/${report.year}`);
    } catch (err) {
      setError('Error al publicar la memoria');
      console.error('Error al publicar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Publicación de la Memoria
        </Typography>
        
        <Typography variant="body1" paragraph>
          Antes de publicar la memoria, puedes previsualizarla para asegurarte de que todo está correcto.
          Una vez publicada, la memoria será visible para todos los usuarios autorizados.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
            disabled={previewLoading}
          >
            {previewLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Generando previsualización...
              </>
            ) : (
              'Previsualizar Memoria'
            )}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PublishIcon />}
            onClick={() => setConfirmDialogOpen(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Publicando...
              </>
            ) : (
              'Publicar Memoria'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Publicación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas publicar esta memoria? Una vez publicada, 
            será visible para todos los usuarios autorizados y no podrás editarla 
            sin volver a marcarla como borrador.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePublish} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Publicando...
              </>
            ) : (
              'Publicar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishReport; 