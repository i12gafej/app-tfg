import React, { useState } from 'react';
import { Box, Button, Typography, useTheme, useMediaQuery } from '@mui/material';
import ReportPart1 from './ReportPart1';
import ReportPart2 from './ReportPart2';
import ReportPart3 from './ReportPart3';
import ReportPart4 from './ReportPart4';
import ReportPart5 from './ReportPart5';
import { useReport } from '@/context/ReportContext';

type Part2Section = 'main' | 'stakeholders' | 'diagnostic';

const ReportNavBar = () => {
  const { report } = useReport();
  const [activePart, setActivePart] = useState<number>(1);
  const [part2Section, setPart2Section] = useState<'stakeholders' | 'diagnostic'>('stakeholders');
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
      p: isMobile ? 0.5 : 2 
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
              backgroundColor: theme.palette.primary.contrastText,
              color: theme.palette.text.black,
              borderColor: theme.palette.text.black,
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              minWidth: isMobile ? '40px' : '64px',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                borderColor: theme.palette.text.black,
              },
              ...(activePart === part && {
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.main,
                }
              })
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
          justifyContent: 'center'
        }}>
          <Button
            variant={part2Section === 'stakeholders' ? 'contained' : 'outlined'}
            onClick={() => setPart2Section('stakeholders')}
            sx={{
              backgroundColor: theme.palette.primary.contrastText,
              color: theme.palette.text.black,
              borderColor: theme.palette.text.black,
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                borderColor: theme.palette.text.black,
              },
              ...(part2Section === 'stakeholders' && {
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.main,
                }
              })
            }}
          >
            Grupos de Interés
          </Button>
          <Button
            variant={part2Section === 'diagnostic' ? 'contained' : 'outlined'}
            onClick={() => setPart2Section('diagnostic')}
            sx={{
              backgroundColor: theme.palette.primary.contrastText,
              color: theme.palette.text.black,
              borderColor: theme.palette.text.black,
              padding: isMobile ? '4px 8px' : '8px 24px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                borderColor: theme.palette.text.black,
              },
              ...(part2Section === 'diagnostic' && {
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.main,
                }
              })
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