import { Container, Box } from '@mui/material';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  whiteBackground?: boolean;
}

const PageContainer = ({ children, whiteBackground }: PageContainerProps) => {
  return (
    <Container  maxWidth={false} disableGutters>
      <Box sx={{ px: 0,
        backgroundColor: whiteBackground ? '#ffffff' : 'transparent'
      }}>
        {children}
      </Box>
    </Container>
  );
};

export default PageContainer; 