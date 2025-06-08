import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ReportPartNavBar from './ReportPartNavBar';
import Mission from './part1/Mission';
import Vision from './part1/Vision';
import Values from './part1/Values';
import Norms from './part1/Norms';
import SustainabilityTeam from './part1/SustainabilityTeam';
import { useReport } from '@/context/ReportContext';

const PART1_SECTIONS = [
  { id: 'mission', label: 'Misión', permissionIndex: 0 },
  { id: 'vision', label: 'Visión', permissionIndex: 1 },
  { id: 'values', label: 'Valores', permissionIndex: 2 },
  { id: 'norms', label: 'Normativa', permissionIndex: 3 },
  { id: 'sustainability-team', label: 'Equipo de Sostenibilidad', permissionIndex: 4 },
];


function decimalToBoolArray(decimal: number, length: number): boolean[] {
  const bin = decimal.toString(2).padStart(length, '0');
  return bin.split('').map(x => x === '1');
}

const ReportPart1 = () => {
  const { report, isExternalAdvisor } = useReport();
  const [activeSection, setActiveSection] = useState('');
  const [permissions, setPermissions] = useState<boolean[]>([]);
  const [allowedSections, setAllowedSections] = useState(PART1_SECTIONS);

  useEffect(() => {
    if (report && isExternalAdvisor && typeof report.permissions === 'number') {
      const perms = decimalToBoolArray(report.permissions, 31);
      setPermissions(perms);
      
      
      const allowed = PART1_SECTIONS.filter(section => perms[section.permissionIndex]);
      setAllowedSections(allowed);
      
      
      if (allowed.length > 0) {
        setActiveSection(allowed[0].id);
      }
    } else {
      
      setAllowedSections(PART1_SECTIONS);
      setActiveSection(PART1_SECTIONS[0].id);
    }
  }, [report, isExternalAdvisor]);

  const renderContent = () => {
    
    const hasPermission = !isExternalAdvisor || allowedSections.some(section => section.id === activeSection);
    
    if (!hasPermission) {
      return null;
    }

    switch (activeSection) {
      case 'mission':
        return <Mission />;
      case 'vision':
        return <Vision />;
      case 'values':
        return <Values />;
      case 'norms':
        return <Norms />;
      case 'sustainability-team':
        return <SustainabilityTeam />;
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
        activeColor="#a2d2e9"
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

export default ReportPart1; 