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
  TableSortLabel,
  Button
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
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
  sortField: 'name' | 'surname' | 'email';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'surname' | 'email') => void;
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
        <Button
          size="small" 
          onClick={() => onSelect(user)}
          title="Ver detalles"
          startIcon={<VisibilityIcon />}
        >
          
        </Button>
      </TableCell>
    </TableRow>
  );
};

const UserList = ({ users, isLoading, onUserSelect, sortField, sortOrder, onSort }: UserListProps) => {
  const [selectedUser, setSelectedUser] = useState<UserServiceUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40}></TableCell>
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
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortOrder : 'asc'}
                  onClick={() => onSort('email')}
                >
                  Correo
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <DraggableUserRow 
                key={user.id} 
                user={user} 
                onSelect={handleViewDetails}
              />
            ))}
          </TableBody>
        </Table>
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