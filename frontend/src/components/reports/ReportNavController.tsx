import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import ReportSearch from './ReportSearch';
import ReportEdit from './ReportEdit';
import PageContainer from '../layout/PageContainer';
import ProtectedRoute from '../common/ProtectedRoute';

const ReportNavController = () => {
  return (
    <PageContainer>
      <Container maxWidth="xl">
        <Box sx={{ py: 0}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Gestión de Memorias de Sostenibilidad
            </Typography>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <ReportSearch />
              </ProtectedRoute>
            } />
            <Route path="/editar/:id" element={
              <ProtectedRoute>
                <ReportEdit />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/memorias" replace />} />
          </Routes>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ReportNavController; 