import React from 'react';
import { Box } from '@mui/material';
import NavButton from '../NavButton';

const NavigationMenu = ({ onNavigate, onSignOut }) => {

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>

      <NavButton 
        onClick={onSignOut}
        variant="signout"
        sx={{ marginLeft: 2 }}
      >
        Sign Out
      </NavButton>
    </Box>
  );
};

export default NavigationMenu;