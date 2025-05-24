import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useReport } from '@/context/ReportContext';
import { reportService, ReportPhoto } from '@/services/reportServices';
import { useAuth } from '@/context/auth.context';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, description: string) => void;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, description);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDescription('');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Subir nueva foto</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<AddPhotoAlternateIcon />}
            >
              Seleccionar foto
            </Button>
          </label>

          {previewUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img 
                src={previewUrl} 
                alt="Vista previa" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  objectFit: 'contain' 
                }} 
              />
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label="Descripción (opcional)"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile}
          variant="contained"
        >
          Subir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  initialDescription: string;
}

const EditDialog: React.FC<EditDialogProps> = ({ open, onClose, onSave, initialDescription }) => {
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  const handleSave = () => {
    onSave(description);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar descripción</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={3}
          margin="normal"
          label="Descripción"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  photoDescription?: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onConfirm, photoDescription }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar esta foto
          {photoDescription ? ` con descripción "${photoDescription}"` : ''}?
          Esta acción no se puede deshacer.
        </DialogContentText>
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

const Gallery = () => {
  const { report, readOnly } = useReport();
  const { token } = useAuth();
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ReportPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPhotos = async () => {
    if (!report?.id || !token) return;
    
    try {
      setIsLoading(true);
      const photos = await reportService.getReportPhotos(report.id, token);
      setPhotos(photos);
    } catch (err) {
      console.error('Error al cargar las fotos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [report?.id, token]);

  const handleUpload = async (file: File, description: string) => {
    if (!report?.id || !token) return;

    try {
      setIsLoading(true);
      await reportService.uploadPhoto(report.id, file, token, description || undefined);
      await loadPhotos();
      setIsUploadDialogOpen(false);
    } catch (err) {
      console.error('Error al subir la foto:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (photo: ReportPhoto) => {
    setSelectedPhoto(photo);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedPhoto) return;

    try {
      setIsLoading(true);
      await reportService.deletePhoto(selectedPhoto.id, token);
      await loadPhotos();
      setIsDeleteDialogOpen(false);
      setSelectedPhoto(null);
    } catch (err) {
      console.error('Error al eliminar la foto:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (photo: ReportPhoto) => {
    setSelectedPhoto(photo);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (description: string) => {
    if (!report?.id || !token || !selectedPhoto) return;

    try {
      setIsLoading(true);
      await reportService.updatePhoto(report.id, selectedPhoto.id, description, token);
      await loadPhotos();
    } catch (err) {
      console.error('Error al actualizar la descripción:', err);
    } finally {
      setIsLoading(false);
      setSelectedPhoto(null);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h6">
          Galería de fotos
        </Typography>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => setIsUploadDialogOpen(true)}
            disabled={isLoading}
          >
            Añadir foto
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={photo.photo}
                alt={photo.description || 'Foto de la galería'}
                sx={{ objectFit: 'cover' }}
              />
              {photo.description && (
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {photo.description}
                  </Typography>
                </CardContent>
              )}
              {!readOnly && (
                <CardActions>
                  <IconButton 
                    onClick={() => handleEdit(photo)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteClick(photo)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {!readOnly && (
        <>
          <UploadDialog
            open={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            onUpload={handleUpload}
          />

          {selectedPhoto && (
            <>
              <EditDialog
                open={isEditDialogOpen}
                onClose={() => {
                  setIsEditDialogOpen(false);
                  setSelectedPhoto(null);
                }}
                onSave={handleSaveEdit}
                initialDescription={selectedPhoto.description || ''}
              />

              <DeleteDialog
                open={isDeleteDialogOpen}
                onClose={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedPhoto(null);
                }}
                onConfirm={handleDeleteConfirm}
                photoDescription={selectedPhoto.description}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Gallery; 