import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import UserCard from '../../components/UserCard';
import UserChatDialog from '../../components/UserChatDialog';
import useExpertUserMessaging from '../../hooks/useExpertUserMessaging';
import { setActiveDialog } from '../../store/expertMessagesSlice';
import { setLastLogout } from '../../store/authSlice';

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #2a1428 70%, #000000 100%)',
  margin: 0,
  padding: 0,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  top: 0,
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(74, 20, 140, 0.1) 0%, transparent 70%), radial-gradient(circle at 70% 80%, rgba(45, 45, 45, 0.2) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: -1,
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 64px)', // Account for navbar height
  width: '100%',
  padding: theme.spacing(2),
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

const UsersGrid = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: theme.spacing(2),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  textAlign: 'center',
  gap: theme.spacing(2),
}));

const ExpertDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { conversations, unreadCounts, markMessagesAsRead, openUserConversation, closeUserConversation } = useExpertUserMessaging();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  // Extract users from conversations
  const users = Object.keys(conversations).map(userName => ({
    username: userName,
    name: userName
  }));

  useEffect(() => {
    // Wait a bit for conversations to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleUserClick = async (user) => {
    if (!user?.username) {
      console.error('Invalid user data');
      return;
    }
    
    setSelectedUser(user);
    setChatDialogOpen(true);
    
    // Set active dialog in Redux
    dispatch(setActiveDialog(user.username));
    
    // Clear unread count for this user
    markMessagesAsRead(user.username);
    
    // Open conversation (loads messages if needed)
    await openUserConversation(user.username);
  };

  const handleCloseChatDialog = async () => {
    setChatDialogOpen(false);
    
    // Close conversation and save to database
    if (selectedUser?.username) {
      await closeUserConversation(selectedUser.username);
    }
    
    setSelectedUser(null);
    
    // Clear active dialog in Redux
    dispatch(setActiveDialog(null));
    
    // Update expert's last logout time for unread calculation
    dispatch(setLastLogout(new Date().toISOString()));
  };

  return (
    <PageWrapper>
      <Navbar />
      <ContentContainer>
        <PageTitle>
          Expert Dashboard - {user?.username}
        </PageTitle>

        {loading ? (
          <LoadingContainer>
            <CircularProgress size={40} sx={{ color: 'rgba(156, 39, 176, 0.8)' }} />
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading conversations...
            </Typography>
          </LoadingContainer>
        ) : users.length === 0 ? (
          <EmptyState>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              No conversations yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Users who contact you will appear here. Stay online to receive messages.
            </Typography>
          </EmptyState>
        ) : (
          <UsersGrid container spacing={3} sx={{ mt: 2 }}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user.username}>
                <UserCard 
                  user={user} 
                  onClick={handleUserClick}
                  unreadCount={unreadCounts[user.username] || 0}
                />
              </Grid>
            ))}
          </UsersGrid>
        )}

        <UserChatDialog
          user={selectedUser}
          open={chatDialogOpen}
          onClose={handleCloseChatDialog}
        />
      </ContentContainer>
    </PageWrapper>
  );
};

export default ExpertDashboard;