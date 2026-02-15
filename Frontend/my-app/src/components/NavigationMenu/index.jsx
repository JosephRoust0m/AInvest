import React, { use } from 'react';
import { Box } from '@mui/material';
import NavButton from '../NavButton';
import { useSelector } from 'react-redux';

const NavigationMenu = ({ onNavigate, onSignOut }) => {
  const userType = useSelector(state => state.auth.userType);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <NavButton onClick={() => onNavigate('/chatbot')}>
            ChatBot
          </NavButton>
      {onNavigate && (
        <>
        {userType === 'advisor' ? (
          <NavButton onClick={() => onNavigate('/advisor-contacts')}>
            Contacts
          </NavButton>
        ) : (
          <NavButton onClick={() => onNavigate('/advisors-consultation')}>
            Advisors
          </NavButton>
      )}
      </>
      )}
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