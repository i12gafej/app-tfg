import { createTheme } from '@mui/material/styles';

// Paleta de colores basada en patrimonio2030.org
const colors = {
  primary: {
    main: '#267FE7', // Azul principal de la web
    light: '#2B6B8E',
    dark: '#0F2F3F',
    contrastText: '#FFFFFF',
    hover: '#323232',
    hovertext: "#FFFFFF",
  },
  secondary: {
    main: '#4CAF50', // Verde para elementos secundarios
    light: '#6FBF73',
    dark: '#357A38',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F6F1C5',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#2F2F2F', // Color principal para textos
    secondary: '#546E7A',
    black: '#000000', 
  },
};

const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    allVariants: {
      fontFamily: 'IBM Plex Sans, sans-serif',
    },
    h1: {
      fontFamily: 'Poppins, sans-serif !important',
      fontSize: '2.8rem',
      fontWeight: 700,
      lineHeight: 1.2,
      marginBottom: '2rem',
      color: colors.text.primary,
    },
    h2: {
      fontFamily: 'Poppins, sans-serif !important',
      fontSize: '2.3rem',
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: '1.5rem',
      color: colors.text.primary,
    },
    h3: {
      fontFamily: 'Poppins, sans-serif !important',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: '1.25rem',
    },
    h4: {
      fontFamily: 'Poppins, sans-serif !important',
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '1rem',
    },
    h5: {
      fontFamily: 'Poppins, sans-serif !important',
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: 'Poppins, sans-serif !important',
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: 'IBM Plex Sans, sans-serif !important',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: 'IBM Plex Sans, sans-serif !important',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * {
          font-family: 'IBM Plex Sans', sans-serif !important;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif !important;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px',
          fontFamily: 'IBM Plex Sans, sans-serif !important',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '24px',
          '& .MuiInputBase-root': {
            fontFamily: 'IBM Plex Sans, sans-serif !important',
          },
          '& .MuiInputLabel-root': {
            fontFamily: 'IBM Plex Sans, sans-serif !important',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.primary.light,
            },
            '&:hover fieldset': {
              borderColor: colors.primary.main,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: 'IBM Plex Sans, sans-serif !important',
        },
        input: {
          fontFamily: 'IBM Plex Sans, sans-serif !important',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: 'IBM Plex Sans, sans-serif !important',
        },
      },
    },
  },
});

export default theme; 