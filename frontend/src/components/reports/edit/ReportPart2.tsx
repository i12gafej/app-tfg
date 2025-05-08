import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';
import StakeholderSearch from './part2/stakeholders/StakeholderSearch';
import MaterialTopicSearch from './part2/diagnosis/MaterialTopic/MaterialTopicSearch';
import Surveys from './part2/diagnosis/Surveys';

// Importar componentes del diagnóstico
import MainSecondaryImpacts from './part2/diagnosis/MainSecondaryImpacts';
import Graphs from './part2/diagnosis/Graphs';
import MaterialityMatrix from './part2/diagnosis/MaterialityMatrix';
import MaterialTopicValidation from './part2/diagnosis/MaterialTopicValidation';
import DiagnosisIndicators from './part2/diagnosis/DiagnosisIndicators';

type Part2Section = 'stakeholders' | 'material-topics' | 'surveys' | 'diagnostic';

interface ReportPart2Props {
  section?: Part2Section;
}

const DIAGNOSIS_SECTIONS = [
  { id: 'impacts', label: 'Impactos Principal y Secundario de los ODS' },
  { id: 'graphs', label: 'Gráficos Impactos ODS' },
  { id: 'materiality-matrix', label: 'Matriz de materialidad' },
  { id: 'validation', label: 'Validación de Asuntos de Materialidad' },
  { id: 'indicators', label: 'Indicadores' },
];

const ReportPart2: React.FC<ReportPart2Props> = ({ section = 'stakeholders' }) => {
  const { report, readOnly } = useReport();
  const [activeDiagnosisSection, setActiveDiagnosisSection] = useState(DIAGNOSIS_SECTIONS[0].id);

  const renderDiagnosisContent = () => {
    switch (activeDiagnosisSection) {
      case 'impacts':
        return <MainSecondaryImpacts reportId={report?.id || 0} onUpdate={() => {}} readOnly={readOnly} />;
      case 'graphs':
        return <Graphs />;
      case 'materiality-matrix':
        return <MaterialityMatrix />;
      case 'validation':
        return <MaterialTopicValidation />;
      case 'indicators':
        return <DiagnosisIndicators />;
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
      case 'material-topics':
        return (
          <Box sx={{ p: 3 }}>
            <MaterialTopicSearch reportId={report?.id || 0} readOnly={readOnly} />
          </Box>
        );
      case 'surveys':
        return (
          <Box sx={{ p: 3 }}>
            <Surveys />
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
              activeColor="#a1c854"
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
            Contenido principal de la Paso 2
          </Box>
        );
    }
  };

  return renderContent();
};

export default ReportPart2; 