import { Typography, Box, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface LogoProps {
  dashboard?: boolean;
}

const Logo = ({ dashboard }: LogoProps) => {
  const theme = useTheme();
  
  return (
    <Box 
      component={RouterLink} 
      to={dashboard ? "/dashboard" : "/"} 
      sx={{ 
        textDecoration: 'none', 
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          fontFamily: 'Poppins, sans-serif !important',
          fontWeight: 700,
          letterSpacing: '0.5px',
          fontSize: { xs: '1.2rem', md: '1.5rem' },
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        Patrimonio
        <span style={{
          fontFamily: 'IBM Plex Sans, sans-serif !important',
          fontWeight: 400,
          color: theme.palette.text.primary,
          marginLeft: 0,
        }}>
          2030
        </span>
      </Typography>
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          fontFamily: 'IBM Plex Sans, sans-serif !important',
          fontWeight: 300,
          letterSpacing: '0.5px',
          fontSize: { xs: '1.2rem', md: '1.5rem' },
          color: theme.palette.text.secondary,
        }}
      >
        App
      </Typography>
    </Box>
  );
};

export default Logo; 