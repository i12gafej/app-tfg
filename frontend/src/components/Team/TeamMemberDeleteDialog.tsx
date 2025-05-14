import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Box
} from '@mui/material';
import { useState } from 'react';
import { teamService, TeamMember } from '@/services/teamService';

interface TeamMemberDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember;
  resourceId: string | null;
  reportId: string | null;
  onDelete: () => void;
}

const TeamMemberDeleteDialog = ({ 
  open, 
  onClose, 
  member,
  resourceId,
  reportId,
  onDelete 
}: TeamMemberDeleteDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await teamService.deleteTeamMember(member.id);
      onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar miembro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Eliminar Miembro del Equipo
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            ¿Está seguro que desea eliminar a {member.name} {member.surname} del equipo?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {member.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rol: {member.role}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organización: {member.organization}
          </Typography>

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
          onClick={handleDelete}
          variant="contained" 
          color="error"
          disabled={isLoading}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMemberDeleteDialog; 