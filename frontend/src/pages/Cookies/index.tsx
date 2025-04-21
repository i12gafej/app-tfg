import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';

const Cookies = () => {
  const [cookiesAccepted, setCookiesAccepted] = useState(
    localStorage.getItem('cookiesAccepted') === 'true'
  );

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesAccepted(true);
  };

  const handleRejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setCookiesAccepted(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Política de Cookies
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="body1" paragraph>
            Última actualización: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            1. ¿Qué son las cookies?
          </Typography>
          <Typography variant="body1" paragraph>
            Las cookies son pequeños archivos de texto que los sitios web colocan en su dispositivo mientras navega. 
            Sirven para recordar sus preferencias y proporcionar una mejor experiencia de usuario.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            2. Tipos de Cookies que Utilizamos
          </Typography>
          <TableContainer component={Paper} sx={{ my: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tipo de Cookie</strong></TableCell>
                  <TableCell><strong>Propósito</strong></TableCell>
                  <TableCell><strong>Duración</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Necesarias</TableCell>
                  <TableCell>Esenciales para el funcionamiento básico del sitio</TableCell>
                  <TableCell>Sesión</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Preferencias</TableCell>
                  <TableCell>Recordar sus preferencias y configuraciones</TableCell>
                  <TableCell>1 año</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Estadísticas</TableCell>
                  <TableCell>Analizar el uso del sitio y mejorar el servicio</TableCell>
                  <TableCell>2 años</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            3. Gestión de Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            Puede gestionar las cookies a través de:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Configuración del Navegador"
                secondary="Puede configurar su navegador para rechazar todas las cookies o indicar cuándo se envía una cookie."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Preferencias de la Plataforma"
                secondary="Puede ajustar sus preferencias de cookies directamente en nuestra plataforma."
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sus Preferencias de Cookies
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleAcceptCookies}
                disabled={cookiesAccepted}
              >
                Aceptar Todas las Cookies
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={handleRejectCookies}
                disabled={!cookiesAccepted}
              >
                Rechazar Cookies No Esenciales
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Estado actual: {cookiesAccepted ? 'Cookies aceptadas' : 'Solo cookies esenciales'}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            4. Cookies de Terceros
          </Typography>
          <Typography variant="body1" paragraph>
            Algunas cookies son colocadas por servicios de terceros que aparecen en nuestras páginas:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Google Analytics"
                secondary="Para análisis de uso del sitio web"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Redes Sociales"
                secondary="Si usa botones de compartir en redes sociales"
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Para más información sobre cómo utilizamos las cookies o para cambiar sus preferencias, 
              puede contactarnos a través de nuestro formulario de contacto.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Cookies; 