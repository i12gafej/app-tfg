import { AppBar, Toolbar, Button, Box, Container, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '@/context/auth.context';

const AdminNavbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const whiteBackgroundRoutes = ['/memorias', '/encuestas', '/backups', '/contact'];
  const shouldHaveWhiteBackground = whiteBackgroundRoutes.includes(location.pathname);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Memorias', path: '/memorias' },
    { text: 'Encuestas', path: '/encuestas' },
    { text: 'Recursos Patrimoniales', path: '/recursos' },
    { text: 'Usuarios', path: '/usuarios' },
    { text: 'Equipo de Sostenibilidad', path: '/equipo' },
    { text: 'Copias de Seguridad', path: '/backup' },
    { text: 'Perfil', path: '/perfil' },
    { text: 'Ayuda', path: '/ayuda-administrador.pdf', external: true },
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
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem 
          button
          onClick={handleLogout}
          sx={{
            color: theme.palette.error.main,
            textDecoration: 'none',
            fontFamily: 'IBM Plex Sans, sans-serif !important',
            fontSize: '0.75rem',
          }}
        >
          <ListItemText primary="Cerrar Sesión" />
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
            minHeight: { xs: '64px', md: '80px' },
            justifyContent: 'space-between',
          }}
        >
          <Logo dashboard={true}/>
          
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2, 
                  display: { lg: 'none' },
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
                  display: { xs: 'block', lg: 'none' },
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
                gap: 2,
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
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1,
                    py: 0.5,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                onClick={handleLogout}
                sx={{
                  ml: 1,
                  color: theme.palette.error.main,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                  },
                }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AdminNavbar; 