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
import { 
  Visibility as VisibilityIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { User as TeamUser } from '@/services/teamService';
import { User as UserServiceUser } from '@/services/userService';
import UserDetailsDialog from '@/components/users/UserDetailsDialog';
import { useDrag } from 'react-dnd';

interface UserListProps {
  users: TeamUser[];
  isLoading: boolean;
  onUserSelect: (user: TeamUser) => void;
}

const DraggableUserRow = ({ user, onSelect }: { user: TeamUser; onSelect: (user: TeamUser) => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'user',
    item: user,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <TableRow 
      ref={drag}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        '&:hover': {
          backgroundColor: alpha('#000', 0.05),
        },
      }}
    >
      <TableCell>
        <DragIndicatorIcon color="action" />
      </TableCell>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.surname}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell align="right">
        <IconButton 
          size="small" 
          onClick={() => onSelect(user)}
          title="Ver detalles"
        >
          <VisibilityIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const UserList = ({ users, isLoading, onUserSelect }: UserListProps) => {
  const [selectedUser, setSelectedUser] = useState<UserServiceUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (user: TeamUser) => {
    const adaptedUser: UserServiceUser = {
      id: parseInt(user.id),
      name: user.name,
      surname: user.surname,
      email: user.email,
      admin: false,
      phone_number: undefined
    };
    setSelectedUser(adaptedUser);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
        No hay usuarios disponibles
      </Typography>
    );
  }

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40}></TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <DraggableUserRow 
                key={user.id} 
                user={user} 
                onSelect={handleViewDetails}
              />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Usuarios por página:"
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {selectedUser && (
        <UserDetailsDialog
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          user={selectedUser}
          onEdit={() => {}}
          readOnly={true}
        />
      )}
    </>
  );
};

export default UserList; 