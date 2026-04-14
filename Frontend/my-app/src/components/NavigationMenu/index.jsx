import React, { useState } from 'react';
import { Box, IconButton, Drawer, List, ListItemButton, ListItemText, Divider, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NavButton from '../NavButton';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const NavigationMenu = ({ onNavigate, onSignOut }) => {
  const userType = useSelector(state => state.auth.userType);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const advisorLink = { label: 'Contacts', path: '/advisor-contacts' };
  const userLink    = { label: 'Advisors', path: '/advisors-consultation' };
  const secondLink  = userType === 'advisor' ? advisorLink : userLink;

  const isChatbotActive = location.pathname === '/chatbot';
  const isSecondActive = location.pathname === secondLink.path;

  const handleNav = (path) => {
    setDrawerOpen(false);
    onNavigate(path);
  };

  const handleSignOut = () => {
    setDrawerOpen(false);
    onSignOut();
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          edge="end"
          onClick={() => setDrawerOpen(true)}
          sx={{ color: 'white', ml: 'auto' }}
          aria-label="open menu"
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 220,
              background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 60%, #2a1428 100%)',
              borderLeft: '1px solid rgba(156, 39, 176, 0.25)',
            },
          }}
        >
          <List sx={{ pt: 2 }}>
            <ListItemButton
              selected={isChatbotActive}
              onClick={() => handleNav('/chatbot')}
              sx={{
                color: 'white',
                borderLeft: isChatbotActive ? '3px solid rgba(156,39,176,0.8)' : '3px solid transparent',
                '&:hover': { background: 'rgba(156,39,176,0.15)' },
                '&.Mui-selected': { background: 'rgba(156,39,176,0.2)' },
                '&.Mui-selected:hover': { background: 'rgba(156,39,176,0.25)' },
              }}
            >
              <ListItemText primary="ChatBot" />
            </ListItemButton>

            {onNavigate && (
              <ListItemButton
                selected={isSecondActive}
                onClick={() => handleNav(secondLink.path)}
                sx={{
                  color: 'white',
                  borderLeft: isSecondActive ? '3px solid rgba(156,39,176,0.8)' : '3px solid transparent',
                  '&:hover': { background: 'rgba(156,39,176,0.15)' },
                  '&.Mui-selected': { background: 'rgba(156,39,176,0.2)' },
                  '&.Mui-selected:hover': { background: 'rgba(156,39,176,0.25)' },
                }}
              >
                <ListItemText primary={secondLink.label} />
              </ListItemButton>
            )}

            <Divider sx={{ borderColor: 'rgba(156,39,176,0.2)', my: 1 }} />

            <ListItemButton onClick={handleSignOut}
              sx={{ color: '#ef9a9a', '&:hover': { background: 'rgba(220,53,69,0.15)' } }}>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </List>
        </Drawer>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
      <NavButton active={isChatbotActive} onClick={() => onNavigate('/chatbot')}>
        ChatBot
      </NavButton>
      {onNavigate && (
        <NavButton active={isSecondActive} onClick={() => onNavigate(secondLink.path)}>
          {secondLink.label}
        </NavButton>
      )}
      <NavButton onClick={onSignOut} variant="signout" sx={{ marginLeft: 2 }}>
        Sign Out
      </NavButton>
    </Box>
  );
};

export default NavigationMenu;
