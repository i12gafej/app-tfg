import { Box, Typography, TextField, Container, Grid, useTheme, Button } from '@mui/material';
import PageContainer from '../../components/layout/PageContainer';
import SendIcon from '@mui/icons-material/Send';

const Contact = () => {
  const theme = useTheme();

  return (
    <PageContainer whiteBackground>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Formulario de consulta
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  color: theme.palette.text.secondary,
                }}
              >
                Si tiene dudas o desea algo específico, rellene nuestro
                formulario de consulta o póngase en contacto mediante email
                o redes sociales:
              </Typography>
              <Typography 
                component="a" 
                href="mailto:contacto@patrimonio2030.org"
                sx={{ 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                contacto@patrimonio2030.org
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box 
              component="form" 
              noValidate
              sx={{ '& .MuiTextField-root': { mb: 3 } }}
            >
              <TextField
                required
                fullWidth
                id="name"
                label="Nombre y apellido"
                placeholder="Nombre y apellido"
              />
              
              <TextField
                required
                fullWidth
                id="email"
                label="Email de contacto"
                placeholder="nombre@dominio.com"
                type="email"
              />

              <TextField
                fullWidth
                id="entity"
                label="Entidad"
                placeholder="Nombre de la entidad"
              />

              <TextField
                fullWidth
                id="position"
                label="Cargo"
                placeholder="Puesto de trabajo"
              />
              
              <TextField
                required
                fullWidth
                id="subject"
                label="Asunto"
                placeholder="Asunto de la consulta"
              />

              <TextField
                fullWidth
                id="message"
                label="Mensaje"
                multiline
                rows={4}
                placeholder="Escriba su mensaje aquí"
              />

              <Button
                variant="contained"
                size="large"
                endIcon={<SendIcon />}
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Enviar consulta
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

export default Contact; 