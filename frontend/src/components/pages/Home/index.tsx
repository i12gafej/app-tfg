import React from 'react';
import { Typography, Container, Box, Paper, Grid, useTheme, useMediaQuery, MobileStepper, Button, IconButton, Tooltip } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { KeyboardArrowLeft, KeyboardArrowRight, HelpOutline } from '@mui/icons-material';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Museum as MuseumIcon,
  Public as PublicIcon,
  Assessment as AssessmentIcon,
  Explore as CompassIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  Campaign as CampaignIcon,
  School as SchoolIcon,
  Storage as StorageIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Handshake as HandshakeIcon,
  Description as DescriptionIcon,
  Park as ParkIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const fadeOut = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

const slideIn = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 }
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 }
};

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { scrollYProgress } = useScroll();
  const [activeStep, setActiveStep] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStep((prevStep) => (prevStep + 1) % conceptPages.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStep((prevStep) => (prevStep - 1 + conceptPages.length) % conceptPages.length);
      setIsTransitioning(false);
    }, 300);
  };

  const conceptPages = [
    {
      title: "Conceptos esenciales",
      description: "Estos tres pilares son la base de nuestra metodología y orientan cada fase del flujo de trabajo:",
      items: [
        {
          icon: <CompassIcon sx={{ fontSize: 40 }} />,
          title: "SDG Compass",
          description: "Metodología adaptada al patrimonio que guía a las organizaciones para alinear su estrategia con los Objetivos de Desarrollo Sostenible, midiendo y comunicando su contribución."
        },
        {
          icon: <PublicIcon sx={{ fontSize: 40 }} />,
          title: "Objetivos de Desarrollo Sostenible (ODS)",
          description: "Los 17 objetivos globales de la Agenda 2030 de la ONU, con sus 169 metas e indicadores, que establecen la hoja de ruta para erradicar la pobreza, proteger el planeta y garantizar el bienestar de todos."
        },
        {
          icon: <GroupIcon sx={{ fontSize: 40 }} />,
          title: "Las 5 P: Personas, Planeta, Prosperidad, Paz y Alianzas",
          description: "Cinco dimensiones para agrupar los ODS y facilitar su aplicación local: Personas (dignidad e igualdad), Planeta (protección ambiental), Prosperidad (crecimiento inclusivo), Paz (justicia y sociedades pacíficas), Alianzas (colaboración multisectorial)."
        }
      ]
    },
    {
      title: "Las guías para la acción del recurso patrimonial en los ODS",
      description: "Tres volúmenes, tres tipos de recurso patrimonial con guías específicas:",
      items: [
        {
          icon: <MuseumIcon sx={{ fontSize: 40 }} />,
          title: "Vol. 1 – Patrimonio cultural",
          description: "Dirigida a museos, monumentos, centros de interpretación, bibliotecas, archivos, yacimientos arqueológicos, conjuntos arqueológicos, patrimonio industrial y arquitectura contemporánea."
        },
        {
          icon: <ParkIcon sx={{ fontSize: 40 }} />,
          title: "Vol. 2 – Patrimonio verde urbano",
          description: "De aplicación en parques y jardines, arbolado viario, infraestructuras ajardinadas (plazas, medianas, glorietas), cementerios y riberas fluviales."
        },
        {
          icon: <HomeIcon sx={{ fontSize: 40 }} />,
          title: "Vol. 3 – Casa-patio",
          description: "Orientada a casas unifamiliares y de vecinos con patio, alojamientos turísticos en casas-patio, monumentos, conventos y monasterios con claustros/patios, y viviendas participantes en el Festival de los Patios de Córdoba."
        }
      ]
    },
    {
      title: "Fases del proceso",
      description: "Tres pasos clave para convertir el diagnóstico en resultados:",
      items: [
        {
          icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
          title: "Análisis de materialidad",
          description: "Identifica y prioriza los asuntos relevantes (impactos positivos/negativos) según la visión del equipo de sostenibilidad y las expectativas de los grupos de interés."
        },
        {
          icon: <FlagIcon sx={{ fontSize: 40 }} />,
          title: "Definición de objetivos",
          description: "Formula metas específicas, medibles y alineadas con los ODS, basadas en los asuntos priorizados y en la estrategia global de la organización."
        },
        {
          icon: <TimelineIcon sx={{ fontSize: 40 }} />,
          title: "Plan de acción",
          description: "Detalla las acciones concretas (qué, quién, cuándo), los recursos necesarios y los indicadores de seguimiento para alcanzar cada objetivo."
        }
      ]
    },
    {
      title: "Seguimiento y comunicación",
      description: "Tres herramientas para controlar el avance y transmitir los logros:",
      items: [
        {
          icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
          title: "Indicadores y métricas",
          description: "Conjunto de indicadores cuantitativos y cualitativos que miden el progreso en cada asunto relevante y permiten ajustes a tiempo."
        },
        {
          icon: <CampaignIcon sx={{ fontSize: 40 }} />,
          title: "Comunicando",
          description: "Estrategias y canales (informes, web, redes, presentaciones) para difundir de forma clara y periódica los compromisos y resultados frente a los ODS."
        },
        {
          icon: <SchoolIcon sx={{ fontSize: 40 }} />,
          title: "Transferencia de conocimiento",
          description: "Mecanismos (sesiones internas, repositorios, talleres) para compartir aprendizajes, buenas prácticas y lecciones entre el equipo de sostenibilidad y la comunidad patrimonial."
        }
      ]
    }
  ];

  const conceptos = [
    {
      icon: <MuseumIcon sx={{ fontSize: 40 }} />,
      title: "Patrimonio cultural",
      description: "Conjunto de bienes culturales y naturales que constituyen la herencia de una comunidad."
    },
    {
      icon: <PublicIcon sx={{ fontSize: 40 }} />,
      title: "Objetivos de Desarrollo Sostenible (ODS)",
      description: "17 objetivos globales establecidos por la ONU para lograr un futuro sostenible."
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      title: "Análisis de materialidad",
      description: "Proceso de identificación y evaluación de asuntos relevantes para la sostenibilidad."
    },
    {
      icon: <CompassIcon sx={{ fontSize: 40 }} />,
      title: "SDG Compass",
      description: "Metodología adaptada para la gestión sostenible del patrimonio cultural."
    },
    {
      icon: <FlagIcon sx={{ fontSize: 40 }} />,
      title: "Definición de objetivos",
      description: "Establecimiento de metas alineadas con los objetivos globales de desarrollo sostenible."
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: "Plan de acción",
      description: "Estrategia para la integración efectiva de la sostenibilidad en el patrimonio."
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: "Indicadores y métricas",
      description: "Sistema de medición para el seguimiento y control de objetivos sostenibles."
    },
    {
      icon: <CampaignIcon sx={{ fontSize: 40 }} />,
      title: "Comunicación y reporting",
      description: "Sistema de difusión y documentación de resultados y avances."
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: "Transferencia de conocimiento",
      description: "Proceso de compartir y difundir el conocimiento con la comunidad patrimonial."
    }
  ];

  const funcionalidades = [
    {
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      title: "Gestión de datos patrimoniales",
      description: "Carga y gestión eficiente de la información base del recurso patrimonial."
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      title: "Análisis de materialidad",
      description: "Herramientas para la selección de indicadores relevantes y análisis de impacto."
    },
    {
      icon: <FlagIcon sx={{ fontSize: 40 }} />,
      title: "Planificación estratégica",
      description: "Establecimiento de objetivos y diseño de planes de acción alineados con los ODS."
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: "Coordinación de alianzas",
      description: "Gestión de colaboraciones y alianzas estratégicas para la sostenibilidad."
    },
    {
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      title: "Generación de informes",
      description: "Creación automática de documentación técnica y memorias de sostenibilidad."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveStep((prevStep) => (prevStep + 1) % conceptPages.length);
        setIsTransitioning(false);
      }, 300);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <PageContainer>
      <Container maxWidth="xl">
        {/* Sección de Introducción */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 4
              }}
            >
              Patrimonio2030 App
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: theme.palette.text.secondary,
                mb: 6
              }}
            >
              Esta plataforma digital nace para acompañar al equipo de sostenibilidad en la elaboración de memorias de sostenibilidad de recursos patrimoniales. Basada en la "Guía para la acción del recurso patrimonial en los ODS" (adaptación de la metodología SDG Compass), ofrece un recorrido claro y estructurado que integra el patrimonio cultural como motor de desarrollo sostenible.
            </Typography>

            {/* Sección Quiénes Somos */}
            <Box sx={{ 
              maxWidth: '1000px', 
              mx: 'auto',
              mt: 8,
              mb: 4,
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1
            }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 4
                }}
              >
                Quiénes Somos
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: theme.palette.text.secondary,
                  mb: 4
                }}
              >
                Esta iniciativa es fruto de la colaboración entre el Club de Córdoba para la UNESCO (CUCO) y la Universidad de Córdoba (UCO), uniendo esfuerzos para promover la sostenibilidad del patrimonio cultural. Juntos, trabajamos para crear herramientas innovadoras que faciliten la gestión y conservación sostenible de nuestro patrimonio.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap'
              }}>
                <Box
                  component="img"
                  src="/logo_cuco.png"
                  alt="Logo CUCO"
                  sx={{
                    height: '100px',
                    objectFit: 'contain'
                  }}
                />
                <Box
                  component="img"
                  src="/logo_uco.png"
                  alt="Logo UCO"
                  sx={{
                    height: '100px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Sección de Presentación de la Aplicación */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            Nuestro Objetivo
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              mb: 6,
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: theme.palette.text.secondary,
              textAlign: 'center'
            }}
          >
            Facilitar al equipo de sostenibilidad la creación de memorias de sostenibilidad de recursos patrimoniales, condensando en una única herramienta todos los pasos de la "Guía para la acción del recurso patrimonial en los ODS". Con esta aplicación queremos:
          </Typography>
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {[
              {
                icon: <TimelineIcon sx={{ fontSize: 40 }} />,
                title: "Guía paso a paso",
                description: "Guiar paso a paso el proceso, desde la carga de datos hasta la generación del informe final.",
                animation: slideIn
              },
              {
                icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
                title: "Estandarización",
                description: "Estandarizar el uso de conceptos clave (patrimonio cultural, asuntos relevantes, materialidad, ODS).",
                animation: fadeIn
              },
              {
                icon: <GroupIcon sx={{ fontSize: 40 }} />,
                title: "Colaboración eficiente",
                description: "Agilizar la toma de decisiones y la colaboración entre todos los miembros del equipo.",
                animation: slideInRight
              }
            ].map((funcionalidad, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={funcionalidad.animation}
                  transition={{ 
                    duration: 0.8,
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-10px) scale(1.02)',
                        boxShadow: 8,
                        '&::after': {
                          transform: 'translateY(0)',
                          opacity: 1
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: theme.palette.text.primary,
                        transform: 'translateY(100%)',
                        opacity: 0,
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        color: theme.palette.text.primary, 
                        mb: 2,
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      {funcionalidad.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        transition: 'color 0.3s ease-in-out',
                        '&:hover': {
                          color: theme.palette.text.primary
                        }
                      }}
                    >
                      {funcionalidad.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          color: theme.palette.text.primary
                        }
                      }}
                    >
                      {funcionalidad.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Sección de Conceptos */}
        <Box sx={{ py: 8, position: 'relative' }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto', position: 'relative' }}>
            <motion.div
              key={activeStep}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeOut}
              transition={{ duration: 0.3 }}
            >
              <Typography 
                variant="h5" 
                component="h3" 
                gutterBottom
                sx={{ 
                  textAlign: 'center',
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.text.primary
                }}
              >
                {conceptPages[activeStep].title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center',
                  mb: 4,
                  color: theme.palette.text.secondary,
                  maxWidth: '800px',
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                {conceptPages[activeStep].description}
                {conceptPages[activeStep].title === "Las guías para la acción del recurso patrimonial en los ODS" && (
                  <Tooltip 
                    title="Más información en https://www.patrimonio2030.org/" 
                    arrow
                    placement="top"
                    onClick={() => window.open('https://www.patrimonio2030.org/', '_blank')}
                  >
                    <IconButton 
                      size="small" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.text.primary
                        }
                      }}
                    >
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Typography>
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

            <Grid container spacing={3}>
              {conceptPages[activeStep].items.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={`${activeStep}-${index}`}>
                  <motion.div
                    initial="hidden"
                    animate={isTransitioning ? "hidden" : "visible"}
                    variants={fadeIn}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1
                    }}
                    style={{ height: '100%' }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        p: 4,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'all 0.3s ease-in-out',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-10px) scale(1.02)',
                          boxShadow: 8,
                          '&::after': {
                            transform: 'translateY(0)',
                            opacity: 1
                          }
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: theme.palette.text.primary,
                          transform: 'translateY(100%)',
                          opacity: 0,
                          transition: 'all 0.3s ease-in-out'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          color: theme.palette.text.primary, 
                          mb: 2,
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          transition: 'color 0.3s ease-in-out',
                          '&:hover': {
                            color: theme.palette.text.primary
                          }
                        }}
                      >
                        {item.title}
      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            color: theme.palette.text.primary
                          },
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {item.description}
      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Indicadores de página */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4,
              gap: 1
            }}>
              {conceptPages.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: index === activeStep ? theme.palette.text.primary : theme.palette.text.secondary,
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
        </Box>

        
      </Container>
    </PageContainer>
  );
};

export default Home; 