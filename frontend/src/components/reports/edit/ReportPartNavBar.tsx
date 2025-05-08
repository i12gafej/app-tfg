import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface NavItem {
  id: string;
  label: string;
}

interface ReportPartNavBarProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  activeColor?: string;
}

const DRAWER_WIDTH = 240;

const ReportPartNavBar: React.FC<ReportPartNavBarProps> = ({
  items,
  activeItem,
  onItemClick,
  activeColor
}) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : '40px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : '40px',
            position: 'relative',
            height: '100%',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-end' : 'center',
            padding: theme.spacing(0, 1),
            minHeight: '48px',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        <List>
          {items.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={activeItem === item.id}
                onClick={() => onItemClick(item.id)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: activeColor || theme.palette.secondary.main,
                    color: '#000000',
                    '&:hover': {
                      backgroundColor: activeColor || theme.palette.secondary.main,
                    }
                  }
                }}
              >
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    transition: theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default ReportPartNavBar; 