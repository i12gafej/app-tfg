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
  TablePagination,
  TableSortLabel
} from '@mui/material';
import { Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';
import { TeamMember, User } from '@/services/teamService';
import TeamMemberDetailsDialog from '@/components/team/TeamMemberDetailsDialog';
import TeamMemberEditDialog from '@/components/team/TeamMemberEditDialog';
import TeamMemberDeleteDialog from '@/components/team/TeamMemberDeleteDialog';
import TeamMemberAssignDialog from '@/components/team/TeamMemberAssignDialog';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import Button from '@mui/material/Button';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  resourceId: string | null;
  reportId: string | null;
  onUpdate: () => void;
  readOnly?: boolean;
  sortField: 'name' | 'surname' | 'role';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'surname' | 'role') => void;
}

const TeamMemberList = ({ 
  teamMembers, 
  isLoading, 
  resourceId, 
  reportId,
  onUpdate,
  readOnly = false,
  sortField,
  sortOrder,
  onSort
}: TeamMemberListProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [droppedUser, setDroppedUser] = useState<User | null>(null);

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

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false);
    setSelectedMember(null);
    onUpdate();
    // Disparar evento para actualizar ambas listas
    const event = new Event('teamMemberDeleted');
    window.dispatchEvent(event);
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setSelectedMember(null);
    onUpdate();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={() => onSort('name')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'surname'}
                    direction={sortField === 'surname' ? sortOrder : 'asc'}
                    onClick={() => onSort('surname')}
                  >
                    Apellidos
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'role'}
                    direction={sortField === 'role' ? sortOrder : 'asc'}
                    onClick={() => onSort('role')}
                  >
                    Rol
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.surname}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewDetails(member)}
                      title="Ver detalles"
                      startIcon={<VisibilityIcon />}
                    >
                    </Button>
                    {!readOnly && (
                      <>
                    <Button 
                      size="small" 
                      color="view"
                      onClick={() => handleEdit(member)}
                      title="Editar"
                      startIcon={<EditIcon />}
                    >
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(member)}
                      title="Eliminar"
                      startIcon={<DeleteOutlineIcon />} 
                    >
                    </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            onUpdate={handleEditSuccess}
          />
          <TeamMemberDeleteDialog
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            member={selectedMember}
            resourceId={resourceId}
            reportId={reportId}
            onDelete={handleDeleteSuccess}
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