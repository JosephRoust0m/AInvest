import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppBar, Toolbar, Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import NavigationMenu from '../NavigationMenu';
import useAuth from '../../model/useAuth';
import ApiGatewayService from '../../api/ApiGatewayService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #2a1428 100%)',
  borderBottom: '1px solid rgba(156, 39, 176, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
}));

const Navbar = () => {
  const { user, userType } = useSelector(state => state.auth);
  const conversations = useSelector(state => state.conversations.conversations);
  const navigate = useNavigate();
  const auth = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const token = await auth.getToken();
      // Save per-conversation last_closed timestamps before signing out
      const convosToSave = conversations
        .filter(c => c.id && c.lastClosedDirty)
        .map(c => ({
          id: c.id,
          last_closed_user: c.last_closed_user ?? null,
          last_closed_advisor: c.last_closed_advisor ?? null,
        }));
      if (convosToSave.length > 0) {
        await ApiGatewayService.saveLastClosed(convosToSave, token).catch(() => {});
      }
      if (userType === 'advisor') {
        await ApiGatewayService.sendLogoutTimestampAdvisor(user.username, token);
      } else {
        await ApiGatewayService.sendLogoutTimestamp(user.username, token);
      }
    } catch (error) {
      console.error('Error during logout process:', error);
    }
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
    <>
      <StyledAppBar position="sticky">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Logo onClick={handleLogoClick} />
          <NavigationMenu
            onNavigate={handleNavigation}
            onSignOut={handleSignOut}
          />
        </Toolbar>
      </StyledAppBar>
      <Backdrop open={loggingOut} sx={{ zIndex: 9999, flexDirection: 'column', gap: 2, bgcolor: 'rgba(0,0,0,0.75)' }}>
        <CircularProgress sx={{ color: '#9c27b0' }} size={52} />
        <Typography sx={{ color: '#fff', letterSpacing: 1 }}>Signing out...</Typography>
      </Backdrop>
    </>
  );
};

export default Navbar;
