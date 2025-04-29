import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/contexts/ReportContext';

// Importar componentes de la parte 3
import ActionPlan from './part3/ActionPlan';
import ContextTimePeriod from './part3/ContextTimePeriod';
import InternalConsistency from './part3/InternalConsistency';

interface ReportPart3Props {
  section?: 'context' | 'action-plan' | 'internal-consistency';
}

const PART3_SECTIONS = [
  { id: 'context', label: 'Contexto y Periodo Temporal' },
  { id: 'action-plan', label: 'Plan de Acción' },
  { id: 'internal-consistency', label: 'Coherencia Interna' },
];

const ReportPart3: React.FC<ReportPart3Props> = ({ section = 'context' }) => {
  const { report } = useReport();
  const [activeSection, setActiveSection] = useState(PART3_SECTIONS[0].id);

  const renderContent = () => {
    switch (activeSection) {
      case 'context':
        return <ContextTimePeriod />;
      case 'action-plan':
        return <ActionPlan />;
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