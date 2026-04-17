import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import AdvisorCard from '../../components/AdvisorCard';
import ApiGatewayService from '../../api/ApiGatewayService';
import { setConversations, openConversation, closeConversation } from '../../store/conversationsSlice';
import { setAdvisors } from '../../store/advisorsSlice';
import { openChat, closeChat } from '../../store/activeChatsSlice';
import AdvisorChatDialog from '../../components/AdvisorChatDialog';
import useMessage from '../../model/useMessage';

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
  const conversations = useSelector(state => state.conversations.conversations);
  const username = useSelector(state => state.auth.user?.username);
  const { getToken } = useAuth();
  useMessage(); // keeps WebSocket connection alive

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
            convo.open = false;
            convo.unreadCount = convo.last_closed_user
              ? convo.conversation.filter(
                  msg => msg.receiver === username && new Date(msg.timestamp) > new Date(convo.last_closed_user)
                ).length
              : 0;
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
    const convo = conversations.find(c => c.user_username === user.username && c.advisor_username === advisor.username);
    if (convo?.id) {
      dispatch(openConversation(convo.id));
    }
    setSelectedAdvisor(advisor);
    setChatDialogOpen(true);
    dispatch(openChat(advisor.username));
  };

  const handleCloseChatDialog = () => {
    setChatDialogOpen(false);
    if (selectedAdvisor?.username) {
      dispatch(closeChat(selectedAdvisor.username));
      const convo = conversations.find(c => c.user_username === user.username && c.advisor_username === selectedAdvisor.username);
      if (convo?.id) {
        dispatch(closeConversation({ convoId: convo.id, userType: 'user' }));
      }
    }
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
