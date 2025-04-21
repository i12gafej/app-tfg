import { Box, Container, Typography } from '@mui/material';
import UserSearch from '@/components/users/UserSearch';

const Users = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <UserSearch />
      </Box>
    </Container>
  );
};

export default Users; 