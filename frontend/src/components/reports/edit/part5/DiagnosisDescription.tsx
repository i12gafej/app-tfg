import React from 'react';
import { Box, Typography } from '@mui/material';

const DiagnosisDescription = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Descripción del Diagnóstico
      </Typography>
      <Typography paragraph>
        Descripción detallada del proceso de diagnóstico y sus resultados principales.
      </Typography>
    </Box>
  );
};

export default DiagnosisDescription; 