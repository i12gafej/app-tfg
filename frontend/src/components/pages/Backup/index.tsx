import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import { useAuth } from '@/context/auth.context';
import { backupService } from '@/services/backupService';

const Backup = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<string>('');

  const handleCreateBackup = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const blob = await backupService.createBackup(token);

      // Genera el nombre del archivo con la fecha actual
      const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}.sql`;

      // Descarga el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Copia de seguridad creada y descargada correctamente');
    } catch (err) {
      console.error('Error:', err);
      setError('Error al crear la copia de seguridad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsRestoreDialogOpen(true);
    }
  };

  const handleRestore = async () => {
    if (!token || !selectedFile) return;
  
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setRestoreProgress('Iniciando restauración...');
  
      const response = await backupService.restoreBackup(selectedFile, token);
  
      setSuccess(response.message || 'Copia de seguridad restaurada correctamente');
      setRestoreProgress('');
      setIsRestoreDialogOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al restaurar la copia de seguridad');
      setRestoreProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Copias de Seguridad
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Crear copia de seguridad
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Crea una copia de seguridad de la base de datos actual. Se descargará automáticamente.
        </Typography>
        <Button
          variant="contained"
          startIcon={<BackupIcon />}
          onClick={handleCreateBackup}
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear copia de seguridad'}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Restaurar copia de seguridad
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Restaura una copia de seguridad previa. Esta acción sobrescribirá los datos actuales.
        </Typography>
        <input
          accept=".sql"
          style={{ display: 'none' }}
          id="restore-file"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="restore-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<RestoreIcon />}
            disabled={isLoading}
            color="warning"
          >
            Seleccionar archivo
          </Button>
        </label>
      </Paper>

      <Dialog
        open={isRestoreDialogOpen}
        onClose={() => {
          if (!isLoading) {
            setIsRestoreDialogOpen(false);
            setSelectedFile(null);
            setRestoreProgress('');
          }
        }}
      >
        <DialogTitle>Confirmar restauración</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas restaurar esta copia de seguridad?
            Esta acción sobrescribirá todos los datos actuales y no se puede deshacer.
            {selectedFile && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                Archivo seleccionado: {selectedFile.name}
              </Box>
            )}
            {isLoading && (
              <Box component="span" sx={{ display: 'block', mt: 2, color: 'warning.main' }}>
                <Typography variant="body2" color="warning">
                  Este proceso puede tardar varios minutos dependiendo del tamaño de la base de datos.
                  Por favor, no cierre esta ventana hasta que se complete la restauración.
                </Typography>
                {restoreProgress && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {restoreProgress}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!isLoading) {
                setIsRestoreDialogOpen(false);
                setSelectedFile(null);
                setRestoreProgress('');
              }
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRestore}
            color="warning"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Restaurar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Backup; 