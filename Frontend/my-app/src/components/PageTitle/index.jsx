import React from 'react';
import { Typography, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPageTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(45deg, #ffffff, #ce93d8)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
}));

const PageTitle = ({ children, variant = "h4", timeout = 800, ...props }) => {
  return (
    <Fade in timeout={timeout}>
      <StyledPageTitle variant={variant} {...props}>
        {children}
      </StyledPageTitle>
    </Fade>
  );
};

export default PageTitle;