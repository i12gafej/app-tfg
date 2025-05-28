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
import { useAuth } from '@/context/auth.context';
import { useState, useEffect } from 'react';
import { teamService, TeamMember } from '@/services/teamService';

interface TeamMemberEditDialogProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember;
  resourceId: string | null;
  reportId: string | null;
  onUpdate: () => void;
}

const ROLES = [
  'Asesor Externo',
  'Consultor',
  'Gestor de Sostenibilidad'
];

const TeamMemberEditDialog = ({ 
  open, 
  onClose, 
  member,
  resourceId,
  reportId,
  onUpdate 
}: TeamMemberEditDialogProps) => {
  const { token } = useAuth();
  const [role, setRole] = useState(member.role);
  const [organization, setOrganization] = useState(member.organization);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar estados cuando cambie el miembro o se abra el diálogo
  useEffect(() => {
    if (open) {
      setRole(member.role);
      setOrganization(member.organization);
      setError(null);
    }
  }, [open, member]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await teamService.updateTeamMember(member.id, {
        role,
        organization
      }, token || '');
      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar miembro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Editar Miembro del Equipo
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Usuario: {member.name} {member.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {member.email}
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
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamMemberEditDialog; 