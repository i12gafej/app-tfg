import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';

// Importar componentes de la parte 5
import Cover from './part5/Cover';
import CommitmentLetter from './part5/CommitmentLetter';
import OrganizationChart from './part5/OrganizationChart';
import DiagnosisDescription from './part5/DiagnosisDescription';
import RoadmapDescription from './part5/RoadmapDescription';
import Agreements from './part5/Agreements';
import Bibliography from './part5/Bibliography';
import Gallery from './part5/Gallery';
import PublishReport from './part5/PublishReport';
import Diffusion from './part5/Diffusion';
import ReportTexts from './part5/ReportTexts';

interface ReportPart5Props {
  section?: 'cover' | 'commitment' | 'organization' | 'diagnosis' | 'roadmap' | 'collaborations' | 'bibliography' | 'annexes' | 'publish' | 'diffusion' | 'texts';
}

const PART5_SECTIONS = [
  { id: 'cover', label: 'Portada', permissionIndex: 21 },
  { id: 'commitment', label: 'Carta de Compromiso', permissionIndex: 22 },
  { id: 'organization', label: 'Organigrama', permissionIndex: 23 },
  { id: 'diagnosis', label: 'Descripción del Diagnóstico', permissionIndex: 24 },
  { id: 'roadmap', label: 'Descripción de la Hoja de Ruta', permissionIndex: 25 },
  { id: 'agreements', label: 'Colaboraciones', permissionIndex: 26 },
  { id: 'bibliography', label: 'Bibliografía', permissionIndex: 27 },
  { id: 'gallery', label: 'Galería', permissionIndex: 28 },
  { id: 'diffusion', label: 'Difusión', permissionIndex: 29 },
  { id: 'texts', label: 'Textos de la Memoria', permissionIndex: 30 },
  { id: 'publish', label: 'Publicar Memoria', permissionIndex: -1 }, // Requiere permisos especiales
];

// Función para convertir decimal a array de booleanos
function decimalToBoolArray(decimal: number, length: number): boolean[] {
  const bin = decimal.toString(2).padStart(length, '0');
  return bin.split('').map(x => x === '1');
}

const ReportPart5: React.FC<ReportPart5Props> = ({ section = 'cover' }) => {
  const { report, isExternalAdvisor, readOnly } = useReport();
  const [activeSection, setActiveSection] = useState('');
  const [permissions, setPermissions] = useState<boolean[]>([]);
  const [allowedSections, setAllowedSections] = useState(PART5_SECTIONS);

  useEffect(() => {
    console.log('ReportPart5 - Debug values:', { 
      isExternalAdvisor, 
      readOnly, 
      reportPermissions: report?.permissions 
    });
    
    // REGLA SIMPLE: "Publicar Memoria" solo se muestra si NO es readOnly Y NO es asesor externo
    const allowed = PART5_SECTIONS.filter(section => {
      if (section.id === 'publish') {
        const shouldShow = !readOnly && !isExternalAdvisor;
        console.log('ReportPart5 - Publicar Memoria shouldShow:', shouldShow, { readOnly, isExternalAdvisor });
        return shouldShow;
      }
      
      // Para asesores externos, verificar permisos en otras secciones
      if (isExternalAdvisor && report && typeof report.permissions === 'number') {
        const perms = decimalToBoolArray(report.permissions, 31);
        return section.permissionIndex === -1 || perms[section.permissionIndex];
      }
      
      // Para usuarios normales, mostrar todas las demás secciones
      return true;
    });
    
    console.log('ReportPart5 - Allowed sections:', allowed.map(s => s.id));
    setAllowedSections(allowed);
    
    // Establecer la primera sección permitida como activa solo si no hay sección activa o la actual no está permitida
    if (allowed.length > 0 && (!activeSection || !allowed.find(s => s.id === activeSection))) {
      console.log('ReportPart5 - Setting active section to:', allowed[0].id);
      setActiveSection(allowed[0].id);
    }
  }, [report, isExternalAdvisor, readOnly]);

  const renderContent = () => {
    // Verificar si la sección activa está permitida
    const hasPermission = !isExternalAdvisor || allowedSections.some(section => section.id === activeSection);
    
    if (!hasPermission) {
      return null;
    }

    switch (activeSection) {
      case 'cover':
        return <Cover />;
      case 'commitment':
        return <CommitmentLetter />;
      case 'organization':
        return <OrganizationChart />;
      case 'diagnosis':
        return <DiagnosisDescription />;
      case 'roadmap':
        return <RoadmapDescription />;
      case 'agreements':
        return <Agreements />;
      case 'bibliography':
        return <Bibliography />;
      case 'gallery':
        return <Gallery />;
      case 'diffusion':
        return <Diffusion />;
      case 'texts':
        return <ReportTexts />;
      case 'publish':
        return <PublishReport />;
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
        onItemClick={setActiveSection}
        activeColor="#fbc38a"
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

export default ReportPart5; 