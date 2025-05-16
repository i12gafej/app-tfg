import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';

// Importar componentes de la parte 3
import ActionPlanText from './part3/ActionPlanText';
import MainObjective from './part3/MainObjective';
import SpecificObjectives from './part3/SpecificObjectives';
import InternalConsistency from './part3/InternalConsistency';
import ActionMainSecondaryImpact from './part3/ActionMainSecondaryImpact';
import InternalConsistencyGraph from './part3/InternalConsistencyGraph';

interface ReportPart3Props {
  section?: 'action-plan-text' | 'main-objective' | 'specific-objectives' | 'action-impacts' | 'internal-consistency' | 'internal-consistency-graph';
}

const PART3_SECTIONS = [
  { id: 'action-plan-text', label: 'Texto de introducción del Plan de sostenibilidad' },
  { id: 'main-objective', label: 'Objetivos de los Asuntos de Materialidad' },
  { id: 'specific-objectives', label: 'Objetivos de la Acción' },
  { id: 'action-impacts', label: 'Impactos de las Acciones' },
  { id: 'internal-consistency', label: 'Coherencia Interna' },
  { id: 'internal-consistency-graph', label: 'Gráfico Coherencia Interna' },
];

const ReportPart3: React.FC<ReportPart3Props> = ({ section = 'action-plan-text' }) => {
  const { report, readOnly } = useReport();
  const [activeSection, setActiveSection] = useState(section);

  const renderContent = () => {
    switch (activeSection) {
      case 'action-plan-text':
        return <ActionPlanText readOnly={readOnly} />;
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
        activeColor="#f5b2c0"
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