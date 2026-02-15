import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import UserCard from '../../components/UserCard';
import AdvisorsAPI from '../../api/AdvisorsAPI';
import { setConversations, saveAllConversations } from '../../store/conversationsSlice';
import { openChat, closeChat, clearActiveChats } from '../../store/activeChatsSlice';
import UserChatDialog from '../../components/UserChatDialog';
import useMessage from '../../model/useMessage';
import useAuth from '../../model/useAuth';


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

const AdvisorContacts = () => {
  // Force update on global conversations-updated event
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const forceUpdate = () => setForceUpdate(f => f + 1);
    window.addEventListener('conversations-updated', forceUpdate);
    return () => window.removeEventListener('conversations-updated', forceUpdate);
  }, []);

    
  const dispatch = useDispatch();
  const advisor = useSelector(state => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const message = useMessage ();
  const auth = useAuth();
  const conversations = useSelector(state => state.conversations.conversations);

  const handleUserClick = (user) => {
    if (!user?.username) {
      console.error('Invalid user data');
      return;
    }
    const conversationId = conversations.find(convo => convo.user_username === user.username)?.id;
    message.clearUnreadCount(conversationId);
    setSelectedUser(user);
    setChatDialogOpen(true);
    // Mark chat as open in Redux
    dispatch(openChat(user.username));
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        if (advisor?.username) {
          const result = await AdvisorsAPI.fetchAllConversations(advisor.username);
          if (result && (result.data || Array.isArray(result))) {
            for (const convo of result.data || result) {
              let unreadCount = message.countUnreadMessages(convo);
              convo.unreadCount = unreadCount;
            }
            dispatch(setConversations(result.data || result));
            //refConversations.current = result.data || result;
          }
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [advisor?.username]);

  const users = conversations === undefined ? [] : conversations.length > 0 ? conversations.map(conv => ({ username: conv.user_username })) : [];

  const handleCloseChatDialog = () => {
    setChatDialogOpen(false);
    if (selectedUser?.username) {
      dispatch(closeChat(selectedUser.username));
    } 

    auth.setNewLogoutTime();
    setSelectedUser(null);
  };

  return (
    <PageWrapper>
      <Navbar />
      <ContentContainer>
        <PageTitle>
          Contacts - {advisor?.username}
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
                  conversations={conversations}
                />
              </Grid>
            ))}
          </UsersGrid>
        )}

        <UserChatDialog
          selectedUser={selectedUser}
          open={chatDialogOpen}
          onClose={handleCloseChatDialog}
        />

      </ContentContainer>
    </PageWrapper>
  );
};

export default AdvisorContacts;