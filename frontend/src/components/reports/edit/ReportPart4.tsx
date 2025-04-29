import React, { useState } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/contexts/ReportContext';

// Importar componentes de la parte 4
import AssignResponsibles from './part4/AssignResponsibles';
import MonitoringTemplates from './part4/MonitoringTemplates';

interface ReportPart4Props {
  section?: 'assign-responsible' | 'monitoring-templates';
}

const PART4_SECTIONS = [
  { id: 'assign-responsibles', label: 'Asignar responsable a acciones' },
  { id: 'monitoring-templates', label: 'Plantilla de seguimiento' },
];

const ReportPart4: React.FC<ReportPart4Props> = ({ section = 'monitoring-templates' }) => {
  const { report } = useReport();
  const [activeSection, setActiveSection] = useState(PART4_SECTIONS[0].id);

  const renderContent = () => {
    switch (activeSection) {
      case 'assign-responsibles':
        return <AssignResponsibles />;
      case 'monitoring-templates':
        return <MonitoringTemplates />;
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
        items={PART4_SECTIONS}
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

export default ReportPart4; 