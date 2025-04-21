import { AppBar, Toolbar, Button, Box, Container, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const UserNavbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const whiteBackgroundRoutes = ['/memorias', '/encuestas', '/cuenta'];
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
    { text: 'Cuenta', path: '/cuenta' },
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
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters 
          sx={{
            minHeight: { xs: '64px', md: '80px' },
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
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    fontSize: '1rem',
                    textTransform: 'none',
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
                  ml: 2,
                  color: theme.palette.error.main,
                  fontWeight: 600,
                  textTransform: 'none',
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

export default UserNavbar; 