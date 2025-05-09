import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import ReportSearch from './ReportSearch';
import ReportEdit from './ReportEdit';
import PageContainer from '../layout/PageContainer';
import ProtectedRoute from '../common/ProtectedRoute';

const ReportNavController = () => {
  const location = useLocation();
  const isSearchPage = location.pathname === '/memorias';

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <Box sx={{ py: 0}}>
          {isSearchPage && (
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Memorias de Sostenibilidad
            </Typography>
          )}
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <ReportSearch />
              </ProtectedRoute>
            } />
            <Route path="/editar/:id/:name/:year" element={
              <ProtectedRoute>
                <ReportEdit />
              </ProtectedRoute>
            } />
            <Route path="/consultar/:id/:name/:year" element={
              <ProtectedRoute>
                <ReportEdit readOnly={true} />
              </ProtectedRoute>
            } />
            <Route path="/asesorar/:id/:name/:year" element={
              <ProtectedRoute>
                <ReportEdit readOnly={true} isExternalAdvisor={true} />
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