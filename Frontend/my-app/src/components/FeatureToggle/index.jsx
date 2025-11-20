import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.spacing(1.5),
  border: '1px solid rgba(156, 39, 176, 0.2)',
  backdropFilter: 'blur(10px)',
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 'none',
    borderRadius: `${theme.spacing(1)} !important`,
    '&:not(:first-of-type)': {
      borderRadius: `${theme.spacing(1)} !important`,
    },
    '&:first-of-type': {
      borderRadius: `${theme.spacing(1)} !important`,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  minWidth: '140px',
  '&:hover': {
    background: 'rgba(156, 39, 176, 0.1)',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  '&.Mui-selected': {
    background: 'linear-gradient(135deg, #2a1428 0%, #1a1a1a 100%)',
    color: 'white',
    border: '1px solid rgba(156, 39, 176, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, #3a1a38 0%, #2a2a2a 100%)',
    },
  },
}));

const FeatureToggle = ({ value, onChange, options }) => {
  return (
    <StyledToggleButtonGroup
      value={value}
      exclusive
      onChange={onChange}
      aria-label="feature selection"
    >
      {options.map((option) => (
        <StyledToggleButton 
          key={option.value} 
          value={option.value}
        >
          {option.label}
        </StyledToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};

export default FeatureToggle;