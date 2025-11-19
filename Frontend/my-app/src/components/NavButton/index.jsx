import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledNavButton = styled(Button)(({ theme, variant }) => ({
  color: 'white',
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0, 1),
  border: '1px solid transparent',
  transition: 'all 0.3s ease',
  fontWeight: 500,
  
  ...(variant === 'signout' ? {
    border: '1px solid rgba(156, 39, 176, 0.3)',
    '&:hover': {
      background: 'rgba(220, 53, 69, 0.2)',
      borderColor: 'rgba(220, 53, 69, 0.4)',
      transform: 'translateY(-1px)',
    },
  } : {
    '&:hover': {
      background: 'rgba(156, 39, 176, 0.2)',
      borderColor: 'rgba(156, 39, 176, 0.4)',
      transform: 'translateY(-1px)',
    },
  }),
}));

const NavButton = ({ children, onClick, variant, ...props }) => {
  return (
    <StyledNavButton 
      onClick={onClick}
      variant={variant}
      {...props}
    >
      {children}
    </StyledNavButton>
  );
};

export default NavButton;