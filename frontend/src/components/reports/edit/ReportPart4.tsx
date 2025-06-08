import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import { useReport } from '@/context/ReportContext';


import AssignResponsibles from './part4/AssignResponsibles';
import MonitoringTemplates from './part4/MonitoringTemplates';

interface ReportPart4Props {
  section?: 'assign-responsible' | 'monitoring-templates';
}

const PART4_SECTIONS = [
  { id: 'assign-responsibles', label: 'Asignar responsable a acciones', permissionIndex: 19 },
  { id: 'monitoring-templates', label: 'Plantilla de seguimiento', permissionIndex: 20 },
];


function decimalToBoolArray(decimal: number, length: number): boolean[] {
  const bin = decimal.toString(2).padStart(length, '0');
  return bin.split('').map(x => x === '1');
}

const ReportPart4: React.FC<ReportPart4Props> = ({ section = 'monitoring-templates' }) => {
  const { report, isExternalAdvisor } = useReport();
  const [activeSection, setActiveSection] = useState('');
  const [permissions, setPermissions] = useState<boolean[]>([]);
  const [allowedSections, setAllowedSections] = useState(PART4_SECTIONS);

  useEffect(() => {
    if (report && isExternalAdvisor && typeof report.permissions === 'number') {
      const perms = decimalToBoolArray(report.permissions, 31);
      setPermissions(perms);
      
      
      const allowed = PART4_SECTIONS.filter(section => perms[section.permissionIndex]);
      setAllowedSections(allowed);
      
      
      if (allowed.length > 0) {
        setActiveSection(allowed[0].id);
      }
    } else {
      
      setAllowedSections(PART4_SECTIONS);
      setActiveSection(PART4_SECTIONS[0].id);
    }
  }, [report, isExternalAdvisor]);

  const renderContent = () => {
    
    const hasPermission = !isExternalAdvisor || allowedSections.some(section => section.id === activeSection);
    
    if (!hasPermission) {
      return null;
    }

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
        items={allowedSections}
        activeItem={activeSection}
        onItemClick={setActiveSection}
        activeColor="#aeabd7"
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