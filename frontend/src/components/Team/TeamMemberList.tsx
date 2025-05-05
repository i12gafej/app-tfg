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
  alpha,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useState } from 'react';
import { TeamMember, User } from '@/services/teamService';
import TeamMemberDetailsDialog from '@/components/Team/TeamMemberDetailsDialog';
import TeamMemberEditDialog from '@/components/Team/TeamMemberEditDialog';
import TeamMemberDeleteDialog from '@/components/Team/TeamMemberDeleteDialog';
import TeamMemberAssignDialog from '@/components/Team/TeamMemberAssignDialog';
import { useDrop, DropTargetMonitor } from 'react-dnd';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  resourceId: string | null;
  reportId: string | null;
  onUpdate: () => void;
  readOnly?: boolean;
}

const TeamMemberList = ({ 
  teamMembers, 
  isLoading, 
  resourceId, 
  reportId,
  onUpdate,
  readOnly = false
}: TeamMemberListProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [droppedUser, setDroppedUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'user',
    drop: (item: User) => {
      console.log('Dropped user:', item);
      setDroppedUser(item);
      setIsAssignOpen(true);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  const handleAssign = () => {
    setIsAssignOpen(false);
    setDroppedUser(null);
    onUpdate();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const paginatedMembers = teamMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderEmptyState = () => (
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

  return (
    <>
      {teamMembers.length === 0 ? (
        renderEmptyState()
      ) : (
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
                <TableCell>Rol</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.surname}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewDetails(member)}
                      title="Ver detalles"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {!readOnly && (
                      <>
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
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={teamMembers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Miembros por página:"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

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
            onUpdate={onUpdate}
          />
          <TeamMemberDeleteDialog
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            member={selectedMember}
            resourceId={resourceId}
            reportId={reportId}
            onDelete={onUpdate}
          />
        </>
      )}

      {droppedUser && resourceId && reportId && (
        <TeamMemberAssignDialog
          open={isAssignOpen}
          onClose={() => {
            setIsAssignOpen(false);
            setDroppedUser(null);
          }}
          user={droppedUser}
          resourceId={resourceId}
          reportId={reportId}
          onAssign={handleAssign}
        />
      )}
    </>
  );
};

export default TeamMemberList; 