import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/contexts/ReportContext';

// Importar componentes del diagnóstico
import Description from './part2/diagnosis/Description';
import DimensionsODS from './part2/diagnosis/DimensionsODS';
import MaterialTopics from './part2/diagnosis/MaterialTopics';
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
  { id: 'dimensions-ods', label: 'Dimensiones y ODS' },
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
      case 'dimensions-ods':
        return <DimensionsODS />;
      case 'material-topics':
        return <MaterialTopics />;
      case 'impacts':
        return <MainSecondaryImpacts />;
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
            Contenido del Análisis de Grupos de Interés
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