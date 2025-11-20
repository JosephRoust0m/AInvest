import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import ExpertCard from '../../components/ExpertCard';
import ExpertChatDialog from '../../components/ExpertChatDialog';
import ExpertAPI from '../../api/ExpertAPI';
import useExpertMessaging from '../../hooks/useExpertMessaging';
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

const ExpertsGrid = styled(Grid)(({ theme }) => ({
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

const ExpertConsultation = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { unreadCounts, markMessagesAsRead, openExpertConversation, closeExpertConversation } = useExpertMessaging();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const result = await ExpertAPI.getAllExperts();
      
      if (result.success) {
        setExperts(result.experts);
      } else {
        console.error('Failed to fetch experts:', result.error);
        setExperts([]);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExpertClick = async (expert) => {
    if (!user?.email) {
      console.error('User not logged in');
      return;
    }
    
    setSelectedExpert(expert);
    setChatDialogOpen(true);
    
    // Set active dialog in Redux
    dispatch(setActiveDialog(expert.username));
    
    // Clear unread count for this expert
    markMessagesAsRead(expert.username);
    
    // Open conversation (loads messages if needed)
    await openExpertConversation(expert.username);
  };

  const handleCloseChatDialog = async () => {
    setChatDialogOpen(false);
    
    // Close conversation and save to database
    if (selectedExpert?.username) {
      await closeExpertConversation(selectedExpert.username);
    }
    
    setSelectedExpert(null);
    
    // Clear active dialog in Redux
    dispatch(setActiveDialog(null));
    
    // Update user's last logout time for unread calculation
    dispatch(setLastLogout(new Date().toISOString()));
  };

  return (
    <PageWrapper>
      <Navbar />
      <ContentContainer>
        <PageTitle>
          Expert Consultation
        </PageTitle>

        {loading ? (
          <LoadingContainer>
            <CircularProgress size={40} sx={{ color: 'rgba(156, 39, 176, 0.8)' }} />
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading financial experts...
            </Typography>
          </LoadingContainer>
        ) : experts.length === 0 ? (
          <EmptyState>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              No experts available
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Our financial experts are currently unavailable. Please try again later.
            </Typography>
          </EmptyState>
        ) : (
          <ExpertsGrid container spacing={3} sx={{ mt: 2 }}>
            {experts.map((expert) => (
              <Grid item xs={12} sm={8} md={6} lg={4} key={expert.username}>
                <ExpertCard 
                  expert={expert} 
                  onClick={handleExpertClick}
                  unreadCount={unreadCounts[expert.username] || 0}
                />
              </Grid>
            ))}
          </ExpertsGrid>
        )}

        <ExpertChatDialog
          expert={selectedExpert}
          open={chatDialogOpen}
          onClose={handleCloseChatDialog}
          username={user?.username}
        />
      </ContentContainer>
    </PageWrapper>
  );
};

export default ExpertConsultation;