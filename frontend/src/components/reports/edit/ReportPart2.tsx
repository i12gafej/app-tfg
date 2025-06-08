import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';
import StakeholderSearch from './part2/Stakeholders/StakeholderSearch';
import MaterialTopicSearch from './part2/MaterialTopic/MaterialTopicSearch';
import Surveys from './part2/Surveys';


import MainSecondaryImpacts from './part2/MainSecondaryImpacts';
import Graphs from './part2/Graphs';
import MaterialityMatrix from './part2/MaterialityMatrix';
import MaterialTopicValidation from './part2/MaterialTopicValidation';
import DiagnosisIndicators from './part2/DiagnosisIndicators';

type Part2Section = 'stakeholders' | 'material-topics' | 'surveys' | 'diagnostic';

interface ReportPart2Props {
  section?: Part2Section;
}

const DIAGNOSIS_SECTIONS = [
  { id: 'impacts', label: 'Impactos Principal y Secundario de los ODS', permissionIndex: 8 },
  { id: 'graphs', label: 'Gráficos Impactos ODS', permissionIndex: 9 },
  { id: 'materiality-matrix', label: 'Matriz de materialidad', permissionIndex: 10 },
  { id: 'validation', label: 'Validación de Asuntos de Materialidad', permissionIndex: 11 },
  { id: 'indicators', label: 'Indicadores', permissionIndex: 12 },
];


function decimalToBoolArray(decimal: number, length: number): boolean[] {
  const bin = decimal.toString(2).padStart(length, '0');
  return bin.split('').map(x => x === '1');
}

const ReportPart2: React.FC<ReportPart2Props> = ({ section = 'stakeholders' }) => {
  const { report, readOnly, isExternalAdvisor } = useReport();
  const [activeDiagnosisSection, setActiveDiagnosisSection] = useState(DIAGNOSIS_SECTIONS[0].id);
  const [permissions, setPermissions] = useState<boolean[]>([]);

  useEffect(() => {
    if (report && isExternalAdvisor && typeof report.permissions === 'number') {
      setPermissions(decimalToBoolArray(report.permissions, 31));
    }
  }, [report, isExternalAdvisor]);

  const hasDiagnosisSectionPermission = (sectionId: string): boolean => {
    if (!isExternalAdvisor) return true;
    
    const section = DIAGNOSIS_SECTIONS.find(s => s.id === sectionId);
    if (!section) return false;
    
    return permissions[section.permissionIndex];
  };

  const getVisibleDiagnosisSections = () => {
    return DIAGNOSIS_SECTIONS.filter(section => hasDiagnosisSectionPermission(section.id));
  };

  const renderDiagnosisContent = () => {
    if (!hasDiagnosisSectionPermission(activeDiagnosisSection)) {
      return null;
    }

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
          <Box sx={{ p: 0 }}>
            <StakeholderSearch reportId={report?.id || 0} />
          </Box>
        );
      case 'material-topics':
        return (
          <Box sx={{ p: 0 }}>
            <MaterialTopicSearch reportId={report?.id || 0} readOnly={readOnly} />
          </Box>
        );
      case 'surveys':
        return (
          <Box sx={{ p: 0 }}>
            <Surveys />
          </Box>
        );
      case 'diagnostic':
        const visibleSections = getVisibleDiagnosisSections();
        if (visibleSections.length === 0) {
          return (
            <Box sx={{ p: 3 }}>
              <Typography>No tienes acceso a ninguna sección del diagnóstico.</Typography>
            </Box>
          );
        }
        
        if (!visibleSections.find(s => s.id === activeDiagnosisSection)) {
          setActiveDiagnosisSection(visibleSections[0].id);
        }
        return (
          <Box sx={{ 
            display: 'flex', 
            height: '100%',
            backgroundColor: 'background.paper' 
          }}>
            <ReportPartNavBar
              items={visibleSections}
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