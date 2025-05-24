import { Box, Typography, TextField, Container, Grid, useTheme, Button } from '@mui/material';
import PageContainer from '@/components/layout/PageContainer';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { emailService } from '@/services/emailService';

const Contact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    entity: '',
    position: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await emailService.sendContactInfo(formData);
      alert('Mensaje enviado con éxito');
      setFormData({
        name: '',
        email: '',
        entity: '',
        position: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      alert('Error al enviar el mensaje. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer whiteBackground>
      <Container  maxWidth={false} sx={{py:6}}>
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
              onSubmit={handleSubmit}
              sx={{ '& .MuiTextField-root': { mb: 3 } }}
            >
              <TextField
                required
                fullWidth
                id="name"
                label="Nombre y apellido"
                placeholder="Nombre y apellido"
                value={formData.name}
                onChange={handleChange}
              />
              
              <TextField
                required
                fullWidth
                id="email"
                label="Email de contacto"
                placeholder="nombre@dominio.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                id="entity"
                label="Entidad"
                placeholder="Nombre de la entidad"
                value={formData.entity}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                id="position"
                label="Cargo"
                placeholder="Puesto de trabajo"
                value={formData.position}
                onChange={handleChange}
              />
              
              <TextField
                required
                fullWidth
                id="subject"
                label="Asunto"
                placeholder="Asunto de la consulta"
                value={formData.subject}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                id="message"
                label="Mensaje"
                multiline
                rows={4}
                placeholder="Escriba su mensaje aquí"
                value={formData.message}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<SendIcon />}
                disabled={isSubmitting}
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
                {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

export default Contact; 