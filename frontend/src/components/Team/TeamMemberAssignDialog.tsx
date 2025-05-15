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
import { useAuth } from '@/hooks/useAuth';

import { useState } from 'react';
import { teamService, User } from '@/services/teamService';

interface TeamMemberAssignDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  resourceId: string | null;
  reportId: string | null;
  onAssign: () => void;
}

const ROLES = [
  'Asesor Externo',
  'Consultor',
  'Gestor de Sostenibilidad'
];

const TeamMemberAssignDialog = ({ 
  open, 
  onClose, 
  user,
  resourceId,
  reportId,
  onAssign 
}: TeamMemberAssignDialogProps) => {
  const { token } = useAuth();
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await teamService.assignUserToTeam(resourceId!, reportId!, user.id, {
        role,
        organization
      }, token || '');
      onAssign();
      const event = new Event('teamMemberAssigned');
      window.dispatchEvent(event);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar miembro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Asignar Miembro al Equipo
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Usuario: {user.name} {user.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={role}
                  label="Rol"
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => 
                    setRole(e.target.value as string)
                  }
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
                label="Organización"
                value={organization}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setOrganization(e.target.value)
                }
                required
              />
            </Box>

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
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
            Asignar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamMemberAssignDialog; 