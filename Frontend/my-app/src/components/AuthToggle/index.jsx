import { Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const ToggleContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%',
  display: 'flex',
  gap: theme.spacing(1),
  flexDirection: 'row',
}));

const StyledToggleButton = styled(Button)(({ theme, selected }) => ({
  flex: 1,
  minHeight: '44px',
  background: selected 
    ? 'linear-gradient(45deg, #2a1428, #3d1a3d)' 
    : 'linear-gradient(45deg, #1a1a1a, #2c2c2c)',
  color: 'white',
  border: selected 
    ? '1px solid rgba(156, 39, 176, 0.5)' 
    : '1px solid rgba(156, 39, 176, 0.2)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 1),
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '13px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '14px',
    padding: theme.spacing(1.5, 1.5),
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '15px',
    padding: theme.spacing(1.5, 2),
  },
  boxShadow: selected 
    ? '0 6px 20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(156, 39, 176, 0.3)' 
    : '0 4px 15px rgba(0, 0, 0, 0.5)',
  '&:hover': {
    background: selected 
      ? 'linear-gradient(45deg, #331a33, #4d204d)' 
      : 'linear-gradient(45deg, #2a1428, #3d1a3d)',
    transform: 'translateY(-2px)',
    borderColor: 'rgba(156, 39, 176, 0.6)',
    boxShadow: selected 
      ? '0 8px 25px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(156, 39, 176, 0.4)' 
      : '0 6px 20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(156, 39, 176, 0.3)',
  },
  transition: 'all 0.3s ease',
}));

const AuthToggle = ({ value, onChange, options = [] }) => {
  const handleClick = (optionValue) => {
    onChange(null, optionValue);
  };

  return (
    <ToggleContainer>
      {options.map((option) => (
        <StyledToggleButton 
          key={option.value}
          selected={value === option.value}
          onClick={() => handleClick(option.value)}
          aria-label={option.label}
        >
          {option.label}
        </StyledToggleButton>
      ))}
    </ToggleContainer>
  );
};

export default AuthToggle;