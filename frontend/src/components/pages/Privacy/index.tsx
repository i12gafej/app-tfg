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
            1. Identificación del Responsable
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Responsable:</strong> Patrimonio 2030
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Domicilio:</strong><br />
            Centro Cívico Municipal Centro<br />
            Plaza de la Corredera s/n<br />
            14002 Córdoba (España)
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Contacto:</strong> contacto@patrimonio2030.org
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            2. Tratamiento de Datos
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Nuestra aplicación NO recopila datos personales</strong> de los usuarios (nombre, email, ubicación, etc.). 
            La plataforma está diseñada para funcionar sin necesidad de recoger información personal identificable.
          </Typography>
          <Typography variant="body1" paragraph>
            No utilizamos cookies de seguimiento ni herramientas de analítica que procesen datos personales. 
            Únicamente se emplean cookies técnicas estrictamente necesarias para el funcionamiento de la aplicación.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            3. Finalidad y Base Legal
          </Typography>
          <Typography variant="body1" paragraph>
            Al no recopilar datos personales, no existen finalidades de marketing, estadísticas comerciales o 
            tratamientos que requieran base legal específica bajo el RGPD.
          </Typography>
          <Typography variant="body1" paragraph>
            En caso de que en el futuro se añadan servicios que traten datos personales, 
            esta política será actualizada para reflejar dichos cambios y sus correspondientes bases legales.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            4. Seguridad de la Información
          </Typography>
          <Typography variant="body1" paragraph>
            Las contraseñas de usuario se almacenan utilizando <strong>hash con sal (bcrypt)</strong>, 
            lo que garantiza que nunca se guardan en texto plano y no pueden ser revertidas a su forma original.
          </Typography>
          <Typography variant="body1" paragraph>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
            la integridad y confidencialidad de la información, incluyendo protección frente a brechas de seguridad.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            5. Conservación de Datos
          </Typography>
          <Typography variant="body1" paragraph>
            Al no tratar datos personales, no se almacenan ni conservan registros de usuarios con información identificable.
          </Typography>
          <Typography variant="body1" paragraph>
            Los logs técnicos anónimos del sistema se conservan durante un máximo de 30 días 
            para fines de mantenimiento y seguridad, tras lo cual se eliminan automáticamente.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            6. Derechos del Usuario (RGPD)
          </Typography>
          <Typography variant="body1" paragraph>
            Aunque actualmente no tratamos datos personales, informamos que en caso de recogerlos en el futuro, 
            los usuarios tendrán derecho a:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Acceso (Art. 15 RGPD)"
                secondary="Derecho a obtener confirmación sobre si se tratan sus datos y acceder a los mismos."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Rectificación (Art. 16 RGPD)"
                secondary="Derecho a solicitar la corrección de datos inexactos o incompletos."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Supresión (Art. 17 RGPD)"
                secondary="Derecho al 'olvido' y eliminación de sus datos personales."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Limitación (Art. 18 RGPD)"
                secondary="Derecho a solicitar la limitación del tratamiento de sus datos."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Portabilidad (Art. 20 RGPD)"
                secondary="Derecho a recibir sus datos en formato estructurado y transmitirlos a otro responsable."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Oposición (Art. 21 RGPD)"
                secondary="Derecho a oponerse al tratamiento de sus datos personales."
              />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>
            Para ejercer estos derechos, puede contactarnos en: <strong>contacto@patrimonio2030.org</strong>
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            7. Menores de Edad
          </Typography>
          <Typography variant="body1" paragraph>
            Esta aplicación no está dirigida específicamente a menores de 16 años. 
            No solicitamos conscientemente datos personales de menores de edad.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            8. Modificaciones de la Política
          </Typography>
          <Typography variant="body1" paragraph>
            Esta política de privacidad puede ser actualizada ocasionalmente para reflejar cambios 
            en nuestras prácticas o en la legislación aplicable.
          </Typography>
          <Typography variant="body1" paragraph>
            Cualquier modificación será notificada a través de la aplicación y se indicará 
            la fecha de última revisión en la parte superior de esta página.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            9. Contacto y Consultas
          </Typography>
          <Typography variant="body1" paragraph>
            Para cualquier duda, consulta o ejercicio de derechos relacionados con esta política de privacidad, 
            puede contactarnos a través de:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Email"
                secondary="contacto@patrimonio2030.org"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Dirección postal"
                secondary="Centro Cívico Municipal Centro, Plaza de la Corredera s/n, 14002 Córdoba (España)"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            10. Jurisdicción y Reclamaciones
          </Typography>
          <Typography variant="body1" paragraph>
            Esta política de privacidad se rige por la normativa española y europea en materia de protección de datos 
            (LOPDGDD y RGPD).
          </Typography>
          <Typography variant="body1" paragraph>
            En caso de considerar que sus derechos han sido vulnerados, puede presentar una reclamación ante la 
            <strong> Agencia Española de Protección de Datos (AEPD)</strong> a través de su sede electrónica 
            (www.aepd.es) o en su dirección postal: C/ Jorge Juan, 6, 28001 Madrid.
          </Typography>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Resumen:</strong> Esta aplicación no recopila datos personales de los usuarios. 
              Las contraseñas se protegen mediante hash salado y nunca se almacenan en texto plano. 
              Cumplimos con el RGPD y la LOPDGDD española, garantizando la máxima protección de la privacidad.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Privacy; 