import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#000000',
        color: '#DDDDDD',
      }}
    >
      <Container maxWidth={false} >
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',      
            justifyContent: 'center',  
            height: '100%',            
            textAlign: 'center'        
          }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Enlaces
            </Typography>
            <Link href="https://patrimonio2030.org" target="_blank" color="inherit" display="block">
              patrimonio2030.org
            </Link>
            <Link component={RouterLink} to="/contacto" color="inherit" display="block">
              Contacto
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',      
            justifyContent: 'center',  
            height: '100%',            
            textAlign: 'center'        
          }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacidad" color="inherit" display="block">
              Política de Privacidad
            </Link>
          </Grid>
        </Grid>
        <Typography variant="body2" color="inherit" align="center" sx={{ mt: 3 }}>
          {'© '}
          {currentYear}
          {' Patrimonio2030 App. Todos los derechos reservados.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 