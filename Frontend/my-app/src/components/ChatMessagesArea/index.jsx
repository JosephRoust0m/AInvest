import React, { useRef, useEffect } from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageBubble from '../MessageBubble';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 1,
  maxHeight: '60vh', // Set a maximum height to ensure scrollbar appears
  minHeight: '400px', // Minimum height for better UX
  '&::-webkit-scrollbar': {
    width: '12px', // Make scrollbar wider and more visible
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    margin: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(156, 39, 176, 0.6)',
    borderRadius: '6px',
    border: '2px solid rgba(0, 0, 0, 0.1)',
    '&:hover': {
      background: 'rgba(156, 39, 176, 0.8)',
    },
    '&:active': {
      background: 'rgba(156, 39, 176, 1)',
    },
  },
  // Ensure scrollbar is always visible on Windows/Chrome
  scrollbarWidth: 'auto',
  scrollbarColor: 'rgba(156, 39, 176, 0.6) rgba(0, 0, 0, 0.2)',
}));

const LoadingBubble = styled(Box)(({ theme }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(1, 0),
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  alignSelf: 'flex-start',
  color: 'white',
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: 'rgba(156, 39, 176, 0.8)',
}));

const MessageIcon = styled(Box)(({ theme }) => ({
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(0.5),
}));

const ChatMessagesArea = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  // Scroll when messages change (new messages or typing updates)
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

  // Additional scroll effect for typing animation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isTyping && !lastMessage.isUser) {
      scrollToBottom(false); // Immediate scroll during typing
    }
  }, [messages]);

  return (
    <MessagesContainer ref={containerRef}>
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isFirstMessage={index === 0 && messages.length === 1}
        />
      ))}
      
      {loading && (
        <Fade in timeout={300}>
          <LoadingBubble>
            <MessageIcon>
              <SmartToyIcon sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </MessageIcon>
            <LoadingContainer>
              <CircularProgress size={16} sx={{ color: 'rgba(156, 39, 176, 0.8)' }} />
              <Typography variant="body2">
                Analyzing...
              </Typography>
            </LoadingContainer>
          </LoadingBubble>
        </Fade>
      )}
      
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default ChatMessagesArea;