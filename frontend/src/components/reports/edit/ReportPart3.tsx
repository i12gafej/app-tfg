import React, { useState, useEffect } from 'react';
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
  { id: 'action-plan-text', label: 'Texto de introducción del Plan de acción', permissionIndex: 13 },
  { id: 'main-objective', label: 'Objetivos de los Asuntos de Materialidad', permissionIndex: 14 },
  { id: 'specific-objectives', label: 'Objetivos de la Acción', permissionIndex: 15 },
  { id: 'action-impacts', label: 'Impactos de las Acciones', permissionIndex: 16 },
  { id: 'internal-consistency', label: 'Coherencia Interna', permissionIndex: 17 },
  { id: 'internal-consistency-graph', label: 'Gráfico Coherencia Interna', permissionIndex: 18 },
];

// Función para convertir decimal a array de booleanos
function decimalToBoolArray(decimal: number, length: number): boolean[] {
  const bin = decimal.toString(2).padStart(length, '0');
  return bin.split('').map(x => x === '1');
}

const ReportPart3: React.FC<ReportPart3Props> = ({ section = 'action-plan-text' }) => {
  const { report, readOnly, isExternalAdvisor } = useReport();
  const [activeSection, setActiveSection] = useState('');
  const [permissions, setPermissions] = useState<boolean[]>([]);
  const [allowedSections, setAllowedSections] = useState(PART3_SECTIONS);

  useEffect(() => {
    if (report && isExternalAdvisor && typeof report.permissions === 'number') {
      const perms = decimalToBoolArray(report.permissions, 31);
      setPermissions(perms);
      
      // Filtrar secciones permitidas
      const allowed = PART3_SECTIONS.filter(section => perms[section.permissionIndex]);
      setAllowedSections(allowed);
      
      // Establecer la primera sección permitida como activa
      if (allowed.length > 0) {
        setActiveSection(allowed[0].id);
      }
    } else {
      // Si no es asesor externo, mostrar todas las secciones
      setAllowedSections(PART3_SECTIONS);
      setActiveSection(section);
    }
  }, [report, isExternalAdvisor, section]);

  const renderContent = () => {
    // Verificar si la sección activa está permitida
    const hasPermission = !isExternalAdvisor || allowedSections.some(section => section.id === activeSection);
    
    if (!hasPermission) {
      return null;
    }

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
        items={allowedSections}
        activeItem={activeSection}
        onItemClick={(id) => setActiveSection(id)}
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