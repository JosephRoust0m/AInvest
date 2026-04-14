import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import AdvisorCard from '../../components/AdvisorCard';
import ApiGatewayService from '../../api/ApiGatewayService';
import { setConversations } from '../../store/conversationsSlice';
import { setAdvisors } from '../../store/advisorsSlice';
import { openChat, closeChat } from '../../store/activeChatsSlice';
import AdvisorChatDialog from '../../components/AdvisorChatDialog';
import useMessage from '../../model/useMessage';
import useAuth_ from '../../model/useAuth';

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
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
  width: '100%',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(6),
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

const AdvisorsGrid = styled(Grid)(({ theme }) => ({
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

const AdvisorConsultation = () => {
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const forceUpdate = () => setForceUpdate(f => f + 1);
    window.addEventListener('conversations-updated', forceUpdate);
    return () => window.removeEventListener('conversations-updated', forceUpdate);
  }, []);

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const advisors = useSelector(state => state.advisors.advisors);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const message = useMessage();
  const conversations = useSelector(state => state.conversations.conversations);
  const lastLogout = useSelector(state => state.auth.user?.lastLogout);
  const auth = useAuth_();
  const { getToken } = useAuth();

  // Recalculate unread counts once lastLogout is fetched from DB after sign-in
  useEffect(() => {
    if (!lastLogout || conversations.length === 0) return;
    const updated = conversations.map(convo => ({
      ...convo,
      unreadCount: message.countUnreadMessages(convo),
    }));
    dispatch(setConversations(updated));
  }, [lastLogout]);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const result = await ApiGatewayService.fetchAdvisors(token);
        dispatch(setAdvisors(result || []));
      } catch (error) {
        console.error('Error fetching advisors:', error);
        dispatch(setAdvisors([]));
      } finally {
        setLoading(false);
      }
    };

    const fetchConversationsWithAdvisors = async (username) => {
      try {
        const token = await getToken();
        const result = await ApiGatewayService.fetchUserConversations(username, token);
        if (result && (result.data || Array.isArray(result))) {
          const convos = result.data || result;
          for (const convo of convos) {
            convo.unreadCount = message.countUnreadMessages(convo);
          }
          dispatch(setConversations(convos));
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchAdvisors();
    if (user?.username) {
      fetchConversationsWithAdvisors(user.username);
    }
  }, []);

  const handleAdvisorClick = (advisor) => {
    if (!user?.email) {
      console.error('User not logged in');
      return;
    }
    const conversationId = conversations.find(convo => convo.user_username === user.username)?.id;
    message.clearUnreadCount(conversationId);
    setSelectedAdvisor(advisor);
    setChatDialogOpen(true);
    dispatch(openChat(advisor.username));
  };

  const handleCloseChatDialog = () => {
    setChatDialogOpen(false);
    if (selectedAdvisor?.username) {
      dispatch(closeChat(selectedAdvisor.username));
    }
    auth.setNewLogoutTime();
    setSelectedAdvisor(null);
  };

  return (
    <PageWrapper>
      <Navbar />
      <ContentContainer>
        <PageTitle>
          Advisor Consultation
        </PageTitle>

        {loading ? (
          <LoadingContainer>
            <CircularProgress size={40} sx={{ color: 'rgba(156, 39, 176, 0.8)' }} />
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading financial advisors...
            </Typography>
          </LoadingContainer>
        ) : advisors.length === 0 ? (
          <EmptyState>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              No advisors available
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Our financial advisors are currently unavailable. Please try again later.
            </Typography>
          </EmptyState>
        ) : (
          <AdvisorsGrid container spacing={3} sx={{ mt: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            {advisors.map((advisor) => (
              <Grid item xs={10} sm={8} md={6} lg={4} key={advisor.username}>
                <AdvisorCard
                  advisor={advisor}
                  onClick={handleAdvisorClick}
                  conversations={conversations}
                />
              </Grid>
            ))}
          </AdvisorsGrid>
        )}

        <AdvisorChatDialog
          advisor={selectedAdvisor}
          open={chatDialogOpen}
          onClose={handleCloseChatDialog}
        />
      </ContentContainer>
    </PageWrapper>
  );
};

export default AdvisorConsultation;
