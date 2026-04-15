import React from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  [theme.breakpoints.down('sm')]: {
    backdropFilter: 'none',
    background: 'rgba(35, 35, 35, 0.98)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: theme.spacing(2),
    '& fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.7)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(156, 39, 176, 0.9)',
    },
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  background: 'linear-gradient(135deg, #2a1428 0%, #1a1a1a 100%)',
  border: '1px solid rgba(156, 39, 176, 0.3)',
  width: 44,
  height: 44,
  flexShrink: 0,
  alignSelf: 'flex-end',
  '&:hover': {
    background: 'linear-gradient(135deg, #3a1a38 0%, #2a2a2a 100%)',
    borderColor: 'rgba(156, 39, 176, 0.5)',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

const ChatInput = ({
  inputText,
  onInputChange,
  onSend,
  loading,
  placeholder = "Ask about stocks, markets, or investment advice..."
}) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <InputContainer>
      <StyledTextField
        fullWidth
        placeholder={placeholder}
        value={inputText}
        onChange={onInputChange}
        onKeyPress={handleKeyPress}
        disabled={loading}
        multiline
        maxRows={4}
      />
      <SendButton 
        onClick={onSend}
        disabled={!inputText.trim() || loading}
      >
        {loading ? (
          <CircularProgress size={20} sx={{ color: 'rgba(156, 39, 176, 0.8)' }} />
        ) : (
          <SendIcon />
        )}
      </SendButton>
    </InputContainer>
  );
};

export default ChatInput;