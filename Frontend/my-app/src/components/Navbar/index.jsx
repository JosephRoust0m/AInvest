import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import NavigationMenu from '../NavigationMenu';
import { logout } from '../../store/authSlice';
import AuthAPI from '../../api/AuthAPI';
import useExpertMessaging from '../../hooks/useExpertMessaging';
import useExpertUserMessaging from '../../hooks/useExpertUserMessaging';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #2a1428 100%)',
  borderBottom: '1px solid rgba(156, 39, 176, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
}));

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, userType } = useSelector(state => state.auth);
  const { handleLogout } = useExpertMessaging();
  const { handleExpertLogout } = useExpertUserMessaging();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      if (userType === 'expert') {
        // Handle expert logout
        await handleExpertLogout();
      } else {
        // Handle user logout
        await handleLogout();
        
        // Send logout timestamp to backend with user email (legacy support)
        if (user?.email) {
          await AuthAPI.sendLogoutTimestamp(user.username);
        }
      }
    } catch (error) {
      console.error('Error during logout process:', error);
    }
    
    // Clear Redux state and localStorage
    dispatch(logout());
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
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