import React from 'react';
import { Box, Typography, Container, Grid, IconButton, Paper, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { KeyboardArrowLeft, KeyboardArrowRight, HelpOutline } from '@mui/icons-material';

const STEP_COLORS: Record<number, string> = {
  1: '#a2d2e9',
  2: '#a1c854',
  3: '#f5b2c0',
  4: '#aeabd7',
  5: '#fbc38a'
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const steps = [
  {
    number: 1,
    title: "Entendiendo los ODS",
    description: "En este primer paso, nuestro objetivo es que el equipo de sostenibilidad interiorice plenamente los Objetivos de Desarrollo Sostenible y reconozca cómo su aplicación impacta en la gestión del recurso patrimonial.",
    sections: [
      {
        title: "¿Qué son los ODS?",
        content: "Los 17 Objetivos de Desarrollo Sostenible son la hoja de ruta global aprobada por la ONU en 2015 para erradicar la pobreza, proteger el planeta y garantizar el bienestar de todas las personas antes de 2030."
      },
      {
        title: "Contribución del patrimonio",
        content: "El patrimonio —ya sea cultural, natural o inmobiliario— actúa simultáneamente como medio y fin para los ODS: rehabilitar un edificio histórico mejora la eficiencia energética (ODS 7), salvaguardar saberes locales fortalece la educación (ODS 4) y consolidar espacios patrimoniales promueve la cohesión social (ODS 16)."
      },
      {
        title: "Misión, visión y responsabilidades mínimas",
        content: "Misión: Proteger y transmitir el legado patrimonial como motor de desarrollo social, económico y ambiental.\n\nVisión: Lograr, a largo plazo, un modelo de gestión patrimonial plenamente alineado con las metas de la Agenda 2030.\n\nResponsabilidades: Asegurar el cumplimiento de la normativa internacional y local, integrar los ODS en la toma de decisiones y designar un coordinador de sostenibilidad que lidere este proceso."
      }
    ]
  },
  {
    number: 2,
    title: "Definiendo prioridades",
    description: "Para enfocar tus esfuerzos en los ODS más relevantes, realizamos un Análisis de Materialidad en seis fases:",
    sections: [
      {
        title: "Identificación de las partes interesadas",
        content: "Mapea a todos los grupos que influyen o se ven afectados por tu patrimonio: visitantes, comunidad local, personal interno, proveedores, financiadores, administraciones y voluntariado."
      },
      {
        title: "Identificación de los asuntos relevantes",
        content: "Elabora un listado amplio de temas sociales, ambientales y económicos vinculados a tu recurso (accesibilidad, conservación, economía circular, participación ciudadana…)."
      },
      {
        title: "Implicación de las partes interesadas",
        content: "Somete ese listado a tus stakeholders mediante entrevistas, talleres o encuestas para priorizar sus expectativas y preocupaciones."
      },
      {
        title: "Validación",
        content: "El equipo de sostenibilidad compara las prioridades externas con los retos internos (técnicos, operativos y estratégicos) para afinar la selección de asuntos."
      },
      {
        title: "Selección de indicadores y recopilación de datos",
        content: "Para cada asunto aprobado, define uno o varios indicadores (cuantitativos y cualitativos) que midan tu punto de partida y permitan un seguimiento periódico."
      },
      {
        title: "Definición de prioridades",
        content: "Cruza la relevancia externa (importancia para tus grupos de interés) con el impacto interno (grado de contribución a los ODS) y clasifica cada asunto en \"Alta\", \"Media\" o \"Baja\" prioridad."
      }
    ]
  },
  {
    number: 3,
    title: "Estableciendo objetivos",
    description: "Para transformar el diagnóstico en resultados reales, es fundamental fijar metas claras, medibles y acotadas en el tiempo. Un buen conjunto de objetivos unifica al equipo de sostenibilidad, alinea tu hoja de ruta con la Agenda 2030 y demuestra tu compromiso ante todos los grupos de interés.",
    sections: [
      {
        title: "Adoptar el enfoque 'de fuera hacia dentro'",
        content: "No partimos solo de nuestras capacidades internas, sino que conectamos nuestra estrategia con las políticas globales, nacionales, regionales y locales. Así aseguramos que cada meta aporta tanto a nuestro recurso patrimonial como al desarrollo sostenible del territorio donde operamos."
      },
      {
        title: "Diseñar un plan de acción",
        content: "Para cada asunto priorizado en la matriz de materialidad:\n\n- Define el objetivo principal y los objetivos específicos relacionados.\n- Detalla las acciones concretas (qué, quién, cuándo).\n- Asigna indicadores de rendimiento para medir el avance, evalúa la dificultad, y planifica recursos y plazos."
      },
      {
        title: "Anunciar el compromiso con los ODS",
        content: "Compartir estas metas públicamente —en tu web, redes, informes o presentaciones— refuerza la transparencia y motiva al equipo. Al comunicar de forma regular tus avances, también podrás gestionar riesgos y adaptar el plan según evolucione el proyecto."
      }
    ]
  },
  {
    number: 4,
    title: "Integrando",
    description: "Implementar la sostenibilidad no consiste solo en fijar metas, sino en incorporarlas a la gestión diaria del recurso patrimonial. Al hacerlo, mejorarás la eficiencia operativa, reforzarás tu reputación y contribuirás a un bienestar común.",
    sections: [
      {
        title: "Anclar los objetivos de sostenibilidad",
        content: "- Sensibiliza a toda la organización\n- Integra los ODS en la misión y visión\n- Vincula la sostenibilidad a los sistemas de evaluación\n- Designa un responsable de sostenibilidad"
      },
      {
        title: "Integrar en todas las funciones",
        content: "- Asegura la implicación de cada área\n- Establece protocolos y cuadros de mando\n- Ajusta los procesos internos"
      },
      {
        title: "Participar en alianzas",
        content: "- Identifica aliados clave\n- Define proyectos conjuntos\n- Difunde los resultados"
      }
    ]
  },
  {
    number: 5,
    title: "Informando y comunicando",
    description: "La sostenibilidad solo existe si se comparte. Comunicar de forma regular y transparente tus avances en los ODS refuerza la confianza de visitantes, financiadores y comunidad local, mejora tu reputación y motiva al equipo.",
    sections: [
      {
        title: "Comunicar el rendimiento frente a los ODS",
        content: "- Adopta el lenguaje de los 17 ODS\n- Comparte resultados concretos\n- Detalla la integración de la hoja de ruta\n- Destaca las interconexiones entre ODS"
      },
      {
        title: "Estructura de la memoria de sostenibilidad",
        content: "- Carta de compromiso con los ODS\n- Datos básicos del recurso\n- Misión, visión y valores\n- Organigrama y equipo\n- Grupos de interés\n- Diagnóstico inicial\n- Hoja de ruta\n- Canales de difusión"
      }
    ]
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % steps.length);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + steps.length) % steps.length);
  };

  return (
    <PageContainer>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              mb: 4
            }}
          >
            Bienvenido, {user?.name || 'Usuario'}
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  textAlign: 'left',
                  color: 'text.primary',
                  pl: { xs: 0, md: 4 }
                }}
              >
                Este es el panel de control de la Guía para la Acción del Recurso Patrimonial en los ODS. 
                Aquí encontrarás todo lo necesario para integrar de manera rigurosa y práctica la sostenibilidad 
                en tu patrimonio cultural, verde urbano o casa-patio. El patrimonio es el legado que define 
                nuestra identidad y cohesión social, y su gestión responsable impulsa la economía local, 
                refuerza la equidad y protege el entorno para las generaciones futuras.
              </Typography>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  textAlign: 'right',
                  color: 'text.primary',
                  pr: { xs: 0, md: 4 },
                  mt: { xs: 4, md: 8 }
                }}
              >
                Como miembro del equipo de sostenibilidad, tu rol es fundamental: liderar el diagnóstico, 
                priorizar los asuntos más relevantes, diseñar y ejecutar el plan de acción, y medir el 
                impacto real de cada iniciativa. A continuación, recorre los cinco pasos esenciales que 
                guían este proceso y convierten cada memoria de sostenibilidad en una contribución tangible 
                a la Agenda 2030.
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        {/* Carrusel de Pasos */}
        <Box sx={{ mt: 8, position: 'relative' }}>
          <motion.div
            key={activeStep}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: STEP_COLORS[steps[activeStep].number],
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'black'
                  }}
                >
                  PASO 0{steps[activeStep].number} – {steps[activeStep].title}
                </Typography>
                <Tooltip title="Más información en patrimonio2030.org">
                  <IconButton 
                    size="small" 
                    component="a" 
                    href="https://patrimonio2030.org" 
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'black',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    <HelpOutline />
                  </IconButton>
                </Tooltip>
              </Box>

              <Grid container spacing={4}>
                {/* Columna izquierda - Descripción */}
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1.1rem',
                      lineHeight: 1.8,
                      color: 'black',
                      mb: 4
                    }}
                  >
                    {steps[activeStep].description}
                  </Typography>
                </Grid>

                {/* Columna derecha - Secciones */}
                <Grid item xs={12} md={6}>
                  {steps[activeStep].sections.map((section, index) => (
                    <Box sx={{ mb: 3 }} key={index}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          color: 'black'
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-line',
                          color: 'black'
                        }}
                      >
                        {section.content}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Flechas de navegación */}
          <IconButton
            onClick={handleBack}
            sx={{
              position: 'absolute',
              left: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4
              },
              zIndex: 2
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4
              },
              zIndex: 2
            }}
          >
            <KeyboardArrowRight />
          </IconButton>

          {/* Indicadores de página */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4,
            gap: 1
          }}>
            {steps.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: index === activeStep ? STEP_COLORS[steps[activeStep].number] : 'grey.300',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.2)'
                  }
                }}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </Box>
        </Box>

        {/* Auto-rotación */}
        {React.useEffect(() => {
          const timer = setInterval(() => {
            handleNext();
          }, 10000); // Cambia cada 10 segundos

          return () => clearInterval(timer);
        }, [])}

      </Container>
    </PageContainer>
  );
};

export default Dashboard; 
 