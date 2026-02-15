import React from 'react';
import { useSelector } from 'react-redux';
import { AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import NavigationMenu from '../NavigationMenu';
import useAuth from '../../model/useAuth';
import AuthAPI from '../../api/AuthAPI';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #2a1428 100%)',
  borderBottom: '1px solid rgba(156, 39, 176, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
}));

const Navbar = () => {
  const { user, userType } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const auth = useAuth();
  const handleSignOut = async () => {
    try {
      // Call the correct logout timestamp API based on userType
      if (userType === 'advisor') {
        await AuthAPI.sendLogoutTimestampAdvisor(user.username);
      } else {
        await AuthAPI.sendLogoutTimestamp(user.username);
      }
    } catch (error) {
      console.error('Error during logout process:', error);
    }
    // Clear Redux state (auth and conversations)
    await auth.logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate('/chatbot');
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <Logo onClick={handleLogoClick} />
        <NavigationMenu 
          onNavigate={handleNavigation}
          onSignOut={handleSignOut}
        />
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;