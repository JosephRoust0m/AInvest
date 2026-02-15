
import { Paper, Typography, Avatar, Box, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { useSelector } from 'react-redux';


const AdvisorCardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minWidth: '280px',
  width: '100%',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(156, 39, 176, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    background: 'rgba(156, 39, 176, 0.1)',
    borderColor: 'rgba(156, 39, 176, 0.4)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  },
}));

const UnreadBadge = styled(Badge)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  '& .MuiBadge-badge': {
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
  },
}));

const AdvisorAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  background: 'linear-gradient(135deg, #2a1428 0%, #1a1a1a 100%)',
  border: '2px solid rgba(156, 39, 176, 0.3)',
  marginBottom: theme.spacing(2),
}));

const AdvisorCard = ({ advisor, onClick, conversations}) => {


const unreadCount = conversations.length > 0 ? conversations.find(c => c.advisor_username === advisor.username)?.unreadCount || 0 : 0;

  return (
    <AdvisorCardContainer elevation={0} onClick={() => onClick(advisor)}>
      {unreadCount > 0 && (
        <UnreadBadge badgeContent={unreadCount} />
      )}
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center' 
      }}>
        <AdvisorAvatar>
          <PersonIcon sx={{ fontSize: 30, color: 'rgba(156, 39, 176, 0.8)' }} />
        </AdvisorAvatar>
        
        <Typography variant="h6" sx={{ 
          color: 'white', 
          marginBottom: 1,
          fontWeight: 'bold'
        }}>
          {advisor.username}
        </Typography>
        
        <Typography variant="body2" sx={{ 
          color: 'rgba(255, 255, 255, 0.7)',
          fontStyle: 'italic'
        }}>
          Financial Advisor
        </Typography>
      </Box>
    </AdvisorCardContainer>
  );
};

export default AdvisorCard;