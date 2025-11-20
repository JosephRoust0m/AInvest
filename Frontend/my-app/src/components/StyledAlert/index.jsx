import React from 'react';
import { Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.25),
  border: '1px solid rgba(156, 39, 176, 0.3)',
  background: 'rgba(156, 39, 176, 0.1)',
  backdropFilter: 'blur(10px)',
  '& .MuiAlert-message': {
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  '& .MuiAlert-icon': {
    color: 'rgba(156, 39, 176, 0.9)',
  },
  '&.MuiAlert-standardError': {
    background: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid rgba(244, 67, 54, 0.3)',
    '& .MuiAlert-icon': {
      color: 'rgba(244, 67, 54, 0.9)',
    },
  },
  '&.MuiAlert-standardSuccess': {
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    '& .MuiAlert-icon': {
      color: 'rgba(76, 175, 80, 0.9)',
    },
  },
  '&.MuiAlert-standardWarning': {
    background: 'rgba(255, 152, 0, 0.1)',
    border: '1px solid rgba(255, 152, 0, 0.3)',
    '& .MuiAlert-icon': {
      color: 'rgba(255, 152, 0, 0.9)',
    },
  },
  '&.MuiAlert-standardInfo': {
    background: 'rgba(33, 150, 243, 0.1)',
    border: '1px solid rgba(33, 150, 243, 0.3)',
    '& .MuiAlert-icon': {
      color: 'rgba(33, 150, 243, 0.9)',
    },
  },
}));

const StyledAlert = ({ children, ...props }) => {
  return (
    <CustomAlert {...props}>
      {children}
    </CustomAlert>
  );
};

export default StyledAlert;