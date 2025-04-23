import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  alpha
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useState } from 'react';
import { TeamMember } from '@/services/teamService';
import TeamMemberDetailsDialog from '@/components/Team/TeamMemberDetailsDialog';
import TeamMemberEditDialog from '@/components/Team/TeamMemberEditDialog';
import TeamMemberDeleteDialog from '@/components/Team/TeamMemberDeleteDialog';
import { useDrop, DropTargetMonitor } from 'react-dnd';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  resourceId: string | null;
  reportId: string | null;
  onDrop?: (item: any) => void;
}

const TeamMemberList = ({ 
  teamMembers, 
  isLoading, 
  resourceId, 
  reportId,
  onDrop 
}: TeamMemberListProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'user',
    drop: (item: any) => {
      if (onDrop) {
        onDrop(item);
      }
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleViewDetails = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Box
        ref={drop}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'divider',
          borderRadius: 1,
          backgroundColor: isOver ? alpha('#000', 0.05) : 'transparent',
          transition: 'all 0.2s ease-in-out',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200
        }}
      >
        <Typography color="text.secondary" align="center">
          {isOver ? 'Suelta aquí para asignar al equipo' : 'Arrastra usuarios aquí para asignarlos al equipo'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer 
        component={Paper}
        ref={drop}
        sx={{
          border: isOver ? '2px dashed' : 'none',
          borderColor: 'primary.main',
          backgroundColor: isOver ? alpha('#000', 0.05) : 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Organización</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.surname}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.organization}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewDetails(member)}
                    title="Ver detalles"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(member)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(member)}
                    title="Eliminar"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedMember && (
        <>
          <TeamMemberDetailsDialog
            open={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            member={selectedMember}
          />
          <TeamMemberEditDialog
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            member={selectedMember}
            resourceId={resourceId}
            reportId={reportId}
          />
          <TeamMemberDeleteDialog
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            member={selectedMember}
            resourceId={resourceId}
            reportId={reportId}
          />
        </>
      )}
    </>
  );
};

export default TeamMemberList; 