import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import Mission from './part1/Mission';
import Vision from './part1/Vision';
import Values from './part1/Values';
import Norms from './part1/Norms';
import SustainabilityTeam from './part1/SustainabilityTeam';
import { useReport } from '@/context/ReportContext';

const PART1_SECTIONS = [
  { id: 'mission', label: 'Misión' },
  { id: 'vision', label: 'Visión' },
  { id: 'values', label: 'Valores' },
  { id: 'norms', label: 'Normativa' },
  { id: 'sustainability-team', label: 'Equipo de Sostenibilidad' },
];

const ReportPart1 = () => {
  const { report } = useReport();
  const [activeSection, setActiveSection] = useState(PART1_SECTIONS[0].id);

  const renderContent = () => {
    switch (activeSection) {
      case 'mission':
        return <Mission />;
      case 'vision':
        return <Vision />;
      case 'values':
        return <Values />;
      case 'norms':
        return <Norms />;
      case 'sustainability-team':
        return <SustainabilityTeam />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      
      backgroundColor: 'background.paper' 
    }}>
      <ReportPartNavBar
        items={PART1_SECTIONS}
        activeItem={activeSection}
        onItemClick={setActiveSection}
        activeColor="#a2d2e9"
      />
      <Box sx={{ 
        flex: 1, 
        p: 3,
        overflowY: 'auto'
      }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ReportPart1; 