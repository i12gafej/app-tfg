import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Grid, Divider } from '@mui/material';
import { Resource } from '@/services/resourceService';

interface ResourceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  resource: Resource | null;
}

const ResourceDetailsDialog = ({ open, onClose, onEdit, resource }: ResourceDetailsDialogProps) => {
  if (!resource) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles del Recurso Patrimonial</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Información Básica
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Nombre
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {resource.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Titularidad
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {resource.ownership}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Modelo de Gestión
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {resource.management_model}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Tipología
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {Array.isArray(resource.typology) ? resource.typology.join(', ') : resource.typology}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Información de Contacto */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Información de Contacto
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Dirección Postal
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {resource.postal_address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Dirección Web
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {resource.web_address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Número de Teléfono
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {resource.phone_number}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Información Adicional */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Información Adicional
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Redes Sociales
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {Array.isArray(resource.social_networks) ? resource.social_networks.join(', ') : resource.social_networks}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={onEdit} variant="contained" color="primary">
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourceDetailsDialog; 