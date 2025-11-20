import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const FullscreenContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  margin: 0,
  boxSizing: 'border-box',
});

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  padding: theme.spacing(3, 2.5),
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.25)',
  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
  color: 'white',
  position: 'relative',
  zIndex: 1,
  '& .MuiTextField-root': {
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.85)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#ffffff',
    },
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.5)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.7)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ffffff',
      },
    },
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4, 3),
    maxWidth: 450,
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5, 4),
    maxWidth: 480,
  },
}));

const AuthCard = ({ children, ...props }) => {
  return (
    <FullscreenContainer {...props}>
      <ContentBox>
        {children}
      </ContentBox>
    </FullscreenContainer>
  );
};

export default AuthCard;