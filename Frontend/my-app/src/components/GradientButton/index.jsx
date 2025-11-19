import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1a1a1a, #2c2c2c)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(156, 39, 176, 0.2)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(156, 39, 176, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #2a1428, #3d1a3d)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(156, 39, 176, 0.4)',
    borderColor: 'rgba(156, 39, 176, 0.5)',
  },
  '&:disabled': {
    background: 'linear-gradient(45deg, #0d0d0d, #1a1a1a)',
    boxShadow: 'none',
    transform: 'none',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
}));

const GradientButton = ({ loading, children, ...props }) => {
  return (
    <StyledButton {...props}>
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default GradientButton;