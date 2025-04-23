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
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignUserToTeam, User } from '@/services/teamService';

interface TeamMemberAssignDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  resourceId: string;
  reportId: string;
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
  reportId 
}: TeamMemberAssignDialogProps) => {
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const queryClient = useQueryClient();

  const { mutate: assignUser, isPending } = useMutation({
    mutationFn: (data: { role: string; organization: string }) => 
      assignUserToTeam(resourceId, reportId, user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      onClose();
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    assignUser({ role, organization });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Asignar Usuario al Equipo
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
                label="Organismo"
                value={organization}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setOrganization(e.target.value)
                }
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={20} /> : null}
          >
            Asignar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamMemberAssignDialog; 