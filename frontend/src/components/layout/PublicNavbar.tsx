import { AppBar, Toolbar, Button, Box, Container, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';

const PublicNavbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  
  const whiteBackgroundRoutes = ['/memorias', '/encuestas', '/contacto', '/login'];
  const shouldHaveWhiteBackground = whiteBackgroundRoutes.includes(location.pathname);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Inicio', path: '/' },
    { text: 'Memorias Públicas', path: '/memorias-publicas' },
    { text: 'Encuestas', path: '/encuestas' },
    { text: 'Contacto', path: '/contacto' },
    { text: 'Ayuda', path: '/ayuda-usuario.pdf', external: true },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ 
      textAlign: 'center', 
      backgroundColor: shouldHaveWhiteBackground ? theme.palette.background.paper : theme.palette.background.default 
    }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            sx={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
              fontFamily: 'IBM Plex Sans, sans-serif !important',
              '&:hover': {
                backgroundColor: theme.palette.text.secondary,
                color: theme.palette.primary.hovertext,
              },
            }}
          >
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontFamily: 'IBM Plex Sans, sans-serif !important',
                }
              }}
            />
          </ListItem>
        ))}
        <ListItem 
          component={RouterLink} 
          to="/login"
          sx={{
            color: theme.palette.primary.main,
            textDecoration: 'none',
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans, sans-serif !important',
            '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.hovertext,
              },
          }}
        >
          <ListItemText 
            primary="Acceder"
            sx={{
              '& .MuiTypography-root': {
                fontFamily: 'IBM Plex Sans, sans-serif !important',
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: shouldHaveWhiteBackground ? theme.palette.background.paper : 'transparent',
        boxShadow: 'none',
      }}
    >
      <Container  maxWidth={false}>
        <Toolbar 
          disableGutters 
          sx={{
            minHeight: { xs: '64px', md: '70px' },
            justifyContent: 'space-between',
          }}
        >
          <Logo />
          
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2, 
                  display: { md: 'none' },
                  color: '#000000'
                }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true,
                }}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  '& .MuiDrawer-paper': { 
                    boxSizing: 'border-box', 
                    width: 240,
                    backgroundColor: shouldHaveWhiteBackground ? theme.palette.background.paper : theme.palette.background.default,
                  },
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 3,
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={item.external ? 'a' : RouterLink}
                  href={item.external ? item.path : undefined}
                  to={!item.external ? item.path : undefined}
                  target={item.external ? '_blank' : undefined}
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    fontSize: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontFamily: 'IBM Plex Sans, sans-serif !important',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.hover,
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  ml: 2,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  fontFamily: 'IBM Plex Sans, sans-serif !important',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.hovertext,
                  },
                }}
              >
                Acceder
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default PublicNavbar; 
 
 
 
 
 