import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid,
  Alert,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Resource, resourceService } from '@/services/resourceService';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface ResourceCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onResourceCreated: (resource: Resource) => void;
  token: string;
}

interface TypologyField {
  id: number;
  value: string;
}

interface SocialNetworkField {
  id: number;
  network: string;
  url: string;
}

const ResourceCreateDialog = ({ open, onClose, onResourceCreated, token }: ResourceCreateDialogProps) => {
  const [formData, setFormData] = useState<Partial<Resource>>({
    name: '',
    typology: [],
    ownership: '',
    management_model: '',
    postal_address: '',
    web_address: '',
    phone_number: '',
    social_networks: []
  });

  // Usar useRef para mantener un contador único de IDs
  const nextId = useRef(1);
  
  const [typologies, setTypologies] = useState<TypologyField[]>([]);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Inicializar con un campo vacío cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      nextId.current = 1;
      setTypologies([{ id: nextId.current++, value: '' }]);
      setSocialNetworks([{ id: nextId.current++, network: '', url: '' }]);
    }
  }, [open]);

  const handleChange = (field: keyof Resource, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypologyChange = (id: number, value: string) => {
    setTypologies(prev => 
      prev.map(t => t.id === id ? { ...t, value } : t)
    );
  };

  const handleSocialNetworkChange = (id: number, field: 'network' | 'url', value: string) => {
    setSocialNetworks(prev =>
      prev.map(sn => sn.id === id ? { ...sn, [field]: value } : sn)
    );
  };

  const addTypologyField = () => {
    const lastTypology = typologies[typologies.length - 1];
    if (!lastTypology || lastTypology.value.trim() === '') {
      setError('Por favor, complete la tipología actual antes de agregar otra.');
      return;
    }
    setTypologies(prev => [...prev, { id: nextId.current++, value: '' }]);
  };

  const removeTypologyField = (id: number) => {
    if (typologies.length <= 1) {
      setError('Debe mantener al menos una tipología.');
      return;
    }
    setTypologies(prev => {
      const newTypologies = prev.filter(t => t.id !== id);
      // Si eliminamos el último campo y hay campos vacíos antes, mover el último campo vacío al final
      if (newTypologies.some(t => t.value.trim() === '')) {
        const emptyTypology = newTypologies.find(t => t.value.trim() === '');
        if (emptyTypology) {
          return [
            ...newTypologies.filter(t => t.id !== emptyTypology.id),
            emptyTypology
          ];
        }
      }
      return newTypologies;
    });
  };

  const addSocialNetworkField = () => {
    setSocialNetworks(prev => [...prev, { id: nextId.current++, network: '', url: '' }]);
  };

  const removeSocialNetworkField = (id: number) => {
    setSocialNetworks(prev => prev.filter(sn => sn.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar que todos los campos requeridos estén completos
      if (!formData.name) {
        setError('Por favor, complete el nombre del recurso.');
        return;
      }

      // Validar que todas las tipologías estén completas
      const validTypologies = typologies.filter(t => t.value.trim() !== '');
      if (validTypologies.length === 0) {
        setError('Por favor, complete al menos una tipología.');
        return;
      }

      // Preparar los datos para enviar
      const resourceData = {
        ...formData,
        typology: validTypologies.map(t => t.value),
        social_networks: socialNetworks
          .filter(sn => sn.network.trim() !== '' && sn.url.trim() !== '')
          .map(sn => ({
            network: sn.network,
            url: sn.url
          }))
      };

      // Si no hay redes sociales válidas, enviar un array vacío
      if (resourceData.social_networks.length === 0) {
        resourceData.social_networks = [];
      }

      const newResource = await resourceService.createResource(resourceData, token);
      onResourceCreated(newResource);
      onClose();
    } catch (err) {
      setError('Error al crear el recurso. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      typology: [],
      ownership: '',
      management_model: '',
      postal_address: '',
      web_address: '',
      phone_number: '',
      social_networks: []
    });
    setTypologies([{ id: nextId.current++, value: '' }]);
    setSocialNetworks([{ id: nextId.current++, network: '', url: '' }]);
    setError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Crear Nuevo Recurso Patrimonial</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Titularidad"
                value={formData.ownership}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('ownership', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modelo de Gestión"
                value={formData.management_model}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('management_model', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dirección Postal"
                value={formData.postal_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('postal_address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dirección Web"
                value={formData.web_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('web_address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone_number', e.target.value)}
              />
            </Grid>

            {/* Sección de Tipologías */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tipologías
              </Typography>
              {typologies.map((typology) => (
                <Box key={typology.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Tipología"
                    value={typology.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleTypologyChange(typology.id, e.target.value)
                    }
                  />
                  <IconButton 
                    onClick={() => removeTypologyField(typology.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addTypologyField}
                variant="outlined"
              >
                Agregar Tipología
              </Button>
            </Grid>

            {/* Sección de Redes Sociales */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Redes Sociales
              </Typography>
              {socialNetworks.map((network) => (
                <Box key={network.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Red Social"
                    value={network.network}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleSocialNetworkChange(network.id, 'network', e.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    label="URL"
                    value={network.url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleSocialNetworkChange(network.id, 'url', e.target.value)
                    }
                  />
                  <IconButton 
                    onClick={() => removeSocialNetworkField(network.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addSocialNetworkField}
                variant="outlined"
              >
                Agregar Red Social
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} disabled={loading}>
          Limpiar
        </Button>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { ResourceCreateDialog }; 