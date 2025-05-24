import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Privacy = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Política de Privacidad
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="body1" paragraph>
            Última actualización: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            1. Información que Recopilamos
          </Typography>
          <Typography variant="body1" paragraph>
            Recopilamos información que usted nos proporciona directamente cuando:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Información de Registro"
                secondary="Nombre, correo electrónico y contraseña cuando crea una cuenta."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Información de Perfil"
                secondary="Información adicional que decide compartir en su perfil."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Comunicaciones"
                secondary="Contenido de los mensajes que nos envía a través del formulario de contacto."
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            2. Uso de la Información
          </Typography>
          <Typography variant="body1" paragraph>
            Utilizamos la información recopilada para:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Proporcionar y mantener nuestros servicios"
                secondary="Gestionar su cuenta y proporcionar las funcionalidades de la plataforma."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Mejorar nuestros servicios"
                secondary="Analizar cómo se utilizan nuestros servicios para mejorar la experiencia del usuario."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Comunicarnos con usted"
                secondary="Enviar notificaciones, actualizaciones y responder a sus consultas."
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            3. Protección de Datos
          </Typography>
          <Typography variant="body1" paragraph>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos personales contra el acceso, modificación, divulgación o destrucción no autorizados.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            4. Sus Derechos
          </Typography>
          <Typography variant="body1" paragraph>
            Usted tiene los siguientes derechos en relación con sus datos personales:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Acceso"
                secondary="Derecho a solicitar una copia de sus datos personales."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Rectificación"
                secondary="Derecho a solicitar la corrección de datos inexactos."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Supresión"
                secondary="Derecho a solicitar la eliminación de sus datos personales."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Limitación"
                secondary="Derecho a solicitar la limitación del tratamiento de sus datos."
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            5. Contacto
          </Typography>
          <Typography variant="body1" paragraph>
            Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos a través de:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Email"
                secondary="privacidad@ejemplo.com"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Dirección"
                secondary="Calle Ejemplo, 123, 28000 Madrid, España"
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Esta política de privacidad puede ser actualizada ocasionalmente. La última fecha de actualización se muestra al principio de esta página.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Privacy; 