import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ReportSearch from '@/components/reports/ReportSearch';
import PageContainer from '@/components/layout/PageContainer';

const Reports = () => {
    return (
        <PageContainer>
            <Container maxWidth="xl">
                <Box >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Gestión de Memorias de Sostenibilidad
                    </Typography>
                    <ReportSearch />
                </Box>
            </Container>
        </PageContainer>
    );
};

export default Reports;

