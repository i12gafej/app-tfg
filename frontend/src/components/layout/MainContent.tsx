import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  const location = useLocation();
  const theme = useTheme();

  // Rutas que deberían tener fondo blanco
  const whiteBackgroundRoutes = ['/memorias', '/encuestas', '/contacto', '/login'];
  const shouldHaveWhiteBackground = whiteBackgroundRoutes.includes(location.pathname);

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        py: 0,
        backgroundColor: shouldHaveWhiteBackground ? theme.palette.primary.contrastText : 'transparent',
      }}
    >
      {children}
    </Box>
  );
};

export default MainContent; 