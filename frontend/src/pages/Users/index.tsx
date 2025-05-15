import { Box, Container, Typography } from '@mui/material';
import UserSearch from '@/components/users/UserSearch';
import PageContainer from '../../components/layout/PageContainer';

const Users = () => {
  return (
    <PageContainer>
        <Container  maxWidth={false}>
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                Gestión de Usuarios
                </Typography>
                <UserSearch />
            </Box>
        </Container>
    </PageContainer>
    
  );
};

export default Users; 