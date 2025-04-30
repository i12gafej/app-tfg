import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';

// Importar componentes de la parte 3
import ContextTimePeriod from './part3/ContextTimePeriod';
import MainObjective from './part3/MainObjective';
import SpecificObjectives from './part3/SpecificObjectives';
import InternalConsistency from './part3/InternalConsistency';

interface ReportPart3Props {
  section?: 'context' | 'main-objective' | 'specific-objectives' | 'internal-consistency';
}

const PART3_SECTIONS = [
  { id: 'context', label: 'Contexto y Periodo Temporal' },
  { id: 'main-objective', label: 'Objetivo Principal' },
  { id: 'specific-objectives', label: 'Objetivos Específicos' },
  { id: 'internal-consistency', label: 'Coherencia Interna' },
];

const ReportPart3: React.FC<ReportPart3Props> = ({ section = 'context' }) => {
  const { report } = useReport();
  const [activeSection, setActiveSection] = useState(section);

  const renderContent = () => {
    switch (activeSection) {
      case 'context':
        return <ContextTimePeriod />;
      case 'main-objective':
        return <MainObjective />;
      case 'specific-objectives':
        return <SpecificObjectives />;
      case 'internal-consistency':
        return <InternalConsistency />;
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
        items={PART3_SECTIONS}
        activeItem={activeSection}
        onItemClick={setActiveSection}
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

export default ReportPart3; 