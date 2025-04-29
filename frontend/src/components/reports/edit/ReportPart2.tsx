import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/contexts/ReportContext';
import StakeholderSearch from './part2/stakeholders/StakeholderSearch';
import MaterialTopicSearch from './part2/diagnosis/MaterialTopic/MaterialTopicSearch';

// Importar componentes del diagnóstico
import Description from './part2/diagnosis/Description';

import MainSecondaryImpacts from './part2/diagnosis/MainSecondaryImpacts';
import Graphs from './part2/diagnosis/Graphs';
import Surveys from './part2/diagnosis/Surveys';
import MaterialityMatrix from './part2/diagnosis/MaterialityMatrix';
import Indicators from './part2/diagnosis/Indicators';

interface ReportPart2Props {
  section?: 'stakeholders' | 'diagnostic';
}

const DIAGNOSIS_SECTIONS = [
  { id: 'description', label: 'Descripción' },
  { id: 'material-topics', label: 'Asuntos Relevantes' },
  { id: 'impacts', label: 'Impactos Principal y Secundario' },
  { id: 'graphs', label: 'Gráficos' },
  { id: 'surveys', label: 'Encuestas' },
  { id: 'materiality-matrix', label: 'Matriz de materialidad' },
  { id: 'indicators', label: 'Indicadores' },
];

const ReportPart2: React.FC<ReportPart2Props> = ({ section = 'main' }) => {
  const { report } = useReport();
  const [activeDiagnosisSection, setActiveDiagnosisSection] = useState(DIAGNOSIS_SECTIONS[0].id);

  const renderDiagnosisContent = () => {
    switch (activeDiagnosisSection) {
      case 'description':
        return <Description />;
      case 'material-topics':
        return <MaterialTopicSearch reportId={report?.id || 0} />;
      case 'impacts':
        return <MainSecondaryImpacts reportId={report?.id || 0} onUpdate={() => {}} />;
      case 'graphs':
        return <Graphs />;
      case 'surveys':
        return <Surveys />;
      case 'materiality-matrix':
        return <MaterialityMatrix />;
      case 'indicators':
        return <Indicators />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (section) {
      case 'stakeholders':
        return (
          <Box sx={{ p: 3 }}>
            <StakeholderSearch reportId={report?.id || 0} />
          </Box>
        );
      case 'diagnostic':
        return (
          <Box sx={{ 
            display: 'flex', 
            height: '100%',
            backgroundColor: 'background.paper' 
          }}>
            <ReportPartNavBar
              items={DIAGNOSIS_SECTIONS}
              activeItem={activeDiagnosisSection}
              onItemClick={setActiveDiagnosisSection}
            />
            <Box sx={{ 
              flex: 1, 
              p: 3,
              overflowY: 'auto'
            }}>
              {renderDiagnosisContent()}
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            Contenido principal de la Parte 2
          </Box>
        );
    }
  };

  return renderContent();
};

export default ReportPart2; 