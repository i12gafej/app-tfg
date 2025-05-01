import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';

// Importar componentes de la parte 3
import ContextTimePeriod from './part3/ContextTimePeriod';
import MainObjective from './part3/MainObjective';
import SpecificObjectives from './part3/SpecificObjectives';
import InternalConsistency from './part3/InternalConsistency';
import ActionMainSecondaryImpact from './part3/ActionMainSecondaryImpact';
import InternalConsistencyGraph from './part3/InternalConsistencyGraph';

interface ReportPart3Props {
  section?: 'context' | 'main-objective' | 'specific-objectives' | 'action-impacts' | 'internal-consistency' | 'internal-consistency-graph';
}

const PART3_SECTIONS = [
  { id: 'context', label: 'Contexto y Periodo Temporal' },
  { id: 'main-objective', label: 'Objetivo Principal' },
  { id: 'specific-objectives', label: 'Objetivos Específicos' },
  { id: 'action-impacts', label: 'Impactos de las Acciones' },
  { id: 'internal-consistency', label: 'Coherencia Interna' },
  { id: 'internal-consistency-graph', label: 'Gráfico Coherencia Interna' },
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
      case 'action-impacts':
        return <ActionMainSecondaryImpact />;
      case 'internal-consistency':
        return <InternalConsistency />;
      case 'internal-consistency-graph':
        return <InternalConsistencyGraph />;
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
        onItemClick={(id) => setActiveSection(id as typeof activeSection)}
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