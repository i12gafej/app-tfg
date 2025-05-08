import React, { useState } from 'react';
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

interface ReportPart5Props {
  section?: 'cover' | 'commitment' | 'organization' | 'diagnosis' | 'roadmap' | 'collaborations' | 'bibliography' | 'annexes' | 'publish';
}

const PART5_SECTIONS = [
  { id: 'cover', label: 'Portada' },
  { id: 'commitment', label: 'Carta de Compromiso' },
  { id: 'organization', label: 'Organigrama' },
  { id: 'diagnosis', label: 'Descripción del Diagnóstico' },
  { id: 'roadmap', label: 'Descripción de la Hoja de Ruta' },
  { id: 'agreements', label: 'Colaboraciones' },
  { id: 'bibliography', label: 'Bibliografía' },
  { id: 'gallery', label: 'Galería' },
  { id: 'publish', label: 'Publicar Reporte' },
];

const ReportPart5: React.FC<ReportPart5Props> = ({ section = 'cover' }) => {
  const { report } = useReport();
  const [activeSection, setActiveSection] = useState(PART5_SECTIONS[0].id);

  const renderContent = () => {
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
        items={PART5_SECTIONS}
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