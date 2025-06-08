import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReportNavBar from './edit/ReportNavBar';
import { ReportProvider } from '@/context/ReportContext';

interface ReportEditProps {
  readOnly?: boolean;
  reportName?: string;
  isExternalAdvisor?: boolean;
}

const ReportEdit: React.FC<ReportEditProps> = ({ readOnly = false, isExternalAdvisor = false }) => {
  const { id, name, year } = useParams();
  const navigate = useNavigate();
  const reportId = id ? parseInt(id, 10) : null;

  
  

  useEffect(() => {
    
    const titleElement = document.getElementById('edit-title');
    if (titleElement) {
      titleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleBack = () => {
    navigate('/memorias');
  };

  const handleHelpClick = () => {
    const helpFile = readOnly ? '/ayuda-consultor.pdf' : '/ayuda-gestor.pdf';
    window.open(helpFile, '_blank');
  };

  if (!reportId) {
    
    return <div>ID de reporte inválido</div>;
  }

  return (
    <ReportProvider reportId={reportId} readOnly={readOnly} isExternalAdvisor={isExternalAdvisor}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          py: 1, 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" id="edit-title">
            {readOnly ? `Consultar Memoria de ${name} - ${year}` : `Editar Memoria de ${name} - ${year}`}
          </Typography>
          <Tooltip title={readOnly ? "Ayuda para consultores" : "Ayuda para gestores"}>
            <IconButton 
              onClick={handleHelpClick}
              sx={{ 
                ml: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ flex: 1}}>
          <ReportNavBar />
        </Box>
      </Box>
    </ReportProvider>
  );
};

export default ReportEdit; 