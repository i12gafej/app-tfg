import React, { useState } from 'react';
import { Box, Button, Typography, useTheme, useMediaQuery } from '@mui/material';
import ReportPart1 from './ReportPart1';
import ReportPart2 from './ReportPart2';
import ReportPart3 from './ReportPart3';
import ReportPart4 from './ReportPart4';
import ReportPart5 from './ReportPart5';
import { useReport } from '@/context/ReportContext';

type Part2Section = 'stakeholders' | 'material-topics' | 'surveys' | 'diagnostic';

const STEP_COLORS = {
  1: '#a2d2e9',
  2: '#a1c854',
  3: '#f5b2c0',
  4: '#aeabd7',
  5: '#fbc38a'
};

const ReportNavBar = () => {
  const { report } = useReport();
  const [activePart, setActivePart] = useState<number>(1);
  const [part2Section, setPart2Section] = useState<Part2Section>('stakeholders');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePartClick = (part: number) => {
    setActivePart(part);
    if (part === 2) {
      setPart2Section('stakeholders');
    }
  };

  const renderPart = () => {
    switch (activePart) {
      case 1:
        return <ReportPart1 />;
      case 2:
        return <ReportPart2 section={part2Section} />;
      case 3:
        return <ReportPart3 />;
      case 4:
        return <ReportPart4 />;
      case 5:
        return <ReportPart5 />;
      default:
        return <ReportPart1 />;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: isMobile ? 0.5 : 0,
      py: 1 
    }}>
      
      <Box sx={{ 
        display: 'flex', 
        gap: isMobile ? 0.5 : 1, 
        mb: isMobile ? 1 : 2,
        width: '100%',
        justifyContent: 'center'
      }}>
        {[1, 2, 3, 4, 5].map((part) => (
          <Button
            key={part}
            variant={activePart === part ? 'contained' : 'outlined'}
            onClick={() => handlePartClick(part)}
            sx={{
              backgroundColor: activePart === part ? STEP_COLORS[part as keyof typeof STEP_COLORS] : theme.palette.primary.contrastText,
              color: activePart === part ? '#000000' : theme.palette.text.black,
              borderColor: STEP_COLORS[part as keyof typeof STEP_COLORS],
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              minWidth: isMobile ? '40px' : '64px',
              '&:hover': {
                backgroundColor: activePart === part ? STEP_COLORS[part as keyof typeof STEP_COLORS] : '#F5F5F5',
                borderColor: STEP_COLORS[part as keyof typeof STEP_COLORS],
              }
            }}
          >
            Paso {part}
          </Button>
        ))}
      </Box>

      {activePart === 2 && (
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 0.5 : 1, 
          mb: isMobile ? 1 : 2,
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            variant={part2Section === 'stakeholders' ? 'contained' : 'outlined'}
            onClick={() => setPart2Section('stakeholders')}
            sx={{
              backgroundColor: part2Section === 'stakeholders' ? STEP_COLORS[2] : theme.palette.primary.contrastText,
              color: part2Section === 'stakeholders' ? '#000000' : theme.palette.text.black,
              borderColor: STEP_COLORS[2],
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              '&:hover': {
                backgroundColor: part2Section === 'stakeholders' ? STEP_COLORS[2] : '#F5F5F5',
                borderColor: STEP_COLORS[2],
              }
            }}
          >
            Grupos de Interés
          </Button>
          <Button
            variant={part2Section === 'material-topics' ? 'contained' : 'outlined'}
            onClick={() => setPart2Section('material-topics')}
            sx={{
              backgroundColor: part2Section === 'material-topics' ? STEP_COLORS[2] : theme.palette.primary.contrastText,
              color: part2Section === 'material-topics' ? '#000000' : theme.palette.text.black,
              borderColor: STEP_COLORS[2],
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              '&:hover': {
                backgroundColor: part2Section === 'material-topics' ? STEP_COLORS[2] : '#F5F5F5',
                borderColor: STEP_COLORS[2],
              }
            }}
          >
            Asuntos de Materialidad
          </Button>
          <Button
            variant={part2Section === 'surveys' ? 'contained' : 'outlined'}
            onClick={() => setPart2Section('surveys')}
            sx={{
              backgroundColor: part2Section === 'surveys' ? STEP_COLORS[2] : theme.palette.primary.contrastText,
              color: part2Section === 'surveys' ? '#000000' : theme.palette.text.black,
              borderColor: STEP_COLORS[2],
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              '&:hover': {
                backgroundColor: part2Section === 'surveys' ? STEP_COLORS[2] : '#F5F5F5',
                borderColor: STEP_COLORS[2],
              }
            }}
          >
            Encuesta
          </Button>
          <Button
            variant={part2Section === 'diagnostic' ? 'contained' : 'outlined'}
            onClick={() => setPart2Section('diagnostic')}
            sx={{
              backgroundColor: part2Section === 'diagnostic' ? STEP_COLORS[2] : theme.palette.primary.contrastText,
              color: part2Section === 'diagnostic' ? '#000000' : theme.palette.text.black,
              borderColor: STEP_COLORS[2],
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              '&:hover': {
                backgroundColor: part2Section === 'diagnostic' ? STEP_COLORS[2] : '#F5F5F5',
                borderColor: STEP_COLORS[2],
              }
            }}
          >
            Diagnóstico
          </Button>
        </Box>
      )}

      <Box sx={{ width: '100%', px: isMobile ? 0.5 : 2 }}>
        {renderPart()}
      </Box>
    </Box>
  );
};

export default ReportNavBar; 