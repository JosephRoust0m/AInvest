import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import NavButton from '../NavButton';

const NavigationMenu = ({ onNavigate, onSignOut }) => {
  const { userType } = useSelector(state => state.auth);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {userType === 'expert' ? (
        // Expert navigation
        <NavButton onClick={() => onNavigate('/expert-dashboard')}>
          Expert Dashboard
        </NavButton>
      ) : (
        // User navigation
        <>
          <NavButton onClick={() => onNavigate('/chatbot')}>
            Financial Chatbot
          </NavButton>
          
          <NavButton onClick={() => onNavigate('/experts')}>
            Expert Consultation
          </NavButton>
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