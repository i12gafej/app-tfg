import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ResourceSearch from '@/components/resources/ResourceSearch';
import PageContainer from '@/components/layout/PageContainer';

const Resources = () => {
    return (
        <PageContainer>
            <Container  maxWidth={false}>
                <Box sx={{ py: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                    Gestión de Recursos Patrimoniales
                    </Typography>
                    <ResourceSearch />
                </Box>
            </Container>
        </PageContainer>
        
      );
    };

export default Resources; 