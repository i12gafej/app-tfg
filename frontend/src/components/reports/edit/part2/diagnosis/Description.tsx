import React from 'react';
import { Box, Typography } from '@mui/material';

const Description = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Descripción del Diagnóstico
      </Typography>
      <Typography paragraph>
        Esta sección contiene la descripción general del diagnóstico de sostenibilidad.
      </Typography>
    </Box>
  );
};

export default Description; 