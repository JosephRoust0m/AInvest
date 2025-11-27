import React from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LogoText = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #ffffff, #ce93d8)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  cursor: 'pointer',
  userSelect: 'none',
}));

const Logo = ({ onClick, ...props }) => {
  return (
    <LogoText 
      variant="h6" 
      onClick={onClick}
      {...props}
    >
      AInvest
    </LogoText>
  );
};

export default Logo;