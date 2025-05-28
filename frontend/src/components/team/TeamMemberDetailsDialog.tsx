import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Grid,
  Box
} from '@mui/material';

interface TeamMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
}

interface TeamMemberDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember;
}

const TeamMemberDetailsDialog = ({ open, onClose, member }: TeamMemberDetailsDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Detalles del Miembro del Equipo
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Nombre
              </Typography>
              <Typography variant="body1">
                {member.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Apellidos
              </Typography>
              <Typography variant="body1">
                {member.surname}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Correo Electrónico
              </Typography>
              <Typography variant="body1">
                {member.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Teléfono
              </Typography>
              <Typography variant="body1">
                {member.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Rol
              </Typography>
              <Typography variant="body1">
                {member.role}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Organismo
              </Typography>
              <Typography variant="body1">
                {member.organization}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMemberDetailsDialog; 