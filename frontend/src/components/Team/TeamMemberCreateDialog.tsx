import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { createTeamMember } from '@/services/teamService';

interface TeamMemberCreateDialogProps {
  open: boolean;
  onClose: () => void;
  resourceId: string;
  reportId: string;
}

const ROLES = [
  'Asesor Externo',
  'Consultor',
  'Gestor de Sostenibilidad'
];

const TeamMemberCreateDialog = ({ 
  open, 
  onClose, 
  resourceId, 
  reportId
}: TeamMemberCreateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone_number: '',
    password: '',
    role: '',
    organization: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone_number: '',
        password: '',
        role: '',
        organization: ''
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createTeamMember(resourceId, reportId, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear miembro del equipo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Crear Nuevo Miembro del Equipo
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
            <TextField
              fullWidth
              label="Apellidos"
              value={formData.surname}
              onChange={handleChange('surname')}
              required
            />
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone_number}
              onChange={handleChange('phone_number')}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                label="Rol"
                onChange={handleChange('role')}
                required
              >
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Organismo"
              value={formData.organization}
              onChange={handleChange('organization')}
              required
            />
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Crear
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamMemberCreateDialog; 