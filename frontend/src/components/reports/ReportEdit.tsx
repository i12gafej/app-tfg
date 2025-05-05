import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReportNavBar from './edit/ReportNavBar';
import { ReportProvider } from '@/context/ReportContext';

interface ReportEditProps {
  readOnly?: boolean;
  reportName?: string;
}

const ReportEdit: React.FC<ReportEditProps> = ({ readOnly = false }) => {
  const { id, name, year } = useParams();
  const navigate = useNavigate();
  const reportId = id ? parseInt(id, 10) : null;

  useEffect(() => {
    // Scroll al título de edición
    const titleElement = document.getElementById('edit-title');
    if (titleElement) {
      titleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleBack = () => {
    navigate('/memorias');
  };

  if (!reportId) {
    return <div>ID de reporte inválido</div>;
  }

  return (
    <ReportProvider reportId={reportId} readOnly={readOnly}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" id="edit-title">
            {readOnly ? `Consultar Memoria de ${name} - ${year}` : `Editar Memoria de ${name} - ${year}`}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <ReportNavBar />
        </Box>
      </Box>
    </ReportProvider>
  );
};

export default ReportEdit; 