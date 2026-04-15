import React from 'react';
import { Paper, Typography, Box, Fade, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

// Function to format message text with proper formatting (exclude welcome messages)
const formatMessageText = (text, isWelcomeMessage = false) => {
  if (!text || isWelcomeMessage) return text;
  
  let formatted = text
    // Handle numbered lists (1. 2. 3. etc.) - add line break before
    .replace(/(\d+\.)\s+/g, '\n\n$1 ')
    
    // Handle bullet points with dashes, stars, or bullets
    .replace(/([^\n])\s*([-•*])\s+/g, '$1\n\n$2 ')
    
    // Handle bold text **text** (common in AI responses)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    
    // Add line breaks before section headers or important points
    .replace(/([.!?])\s+([A-Z][a-z]+\s+[A-Z][a-z]+.*?:)/g, '$1\n\n$2')
    
    // Handle warnings or disclaimers (⚠️ symbol) - add line break before
    .replace(/(^|[^\n])⚠️/g, (match, p1) => `${p1}\n\n⚠️`)
    
    // Add spacing after colons when followed by content
    .replace(/(:)\s*(?=[A-Z])/g, '$1 ')
    
    // Clean up multiple newlines (max 2)
    .replace(/\n{3,}/g, '\n\n')
    
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    
    // Trim and ensure proper starting format
    .trim();
    
  return formatted;
};

const MessageBubbleContainer = styled(Paper)(({ theme, isuser, isfirstmessage, isconversation }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(1, 0),
  borderRadius: theme.spacing(2),
  background: isuser === 'true'
    ? 'linear-gradient(135deg, #2a1428 0%, #1a1a1a 100%)'
    : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${isuser === 'true' ? 'rgba(156, 39, 176, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
  backdropFilter: 'blur(10px)',
  alignSelf: isfirstmessage === 'true' ? 'center' : (isuser === 'true' ? 'flex-end' : 'flex-start'),
  color: 'white',
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    // backdrop-filter blur is expensive on mobile — replace with opaque background
    backdropFilter: 'none',
    background: isuser === 'true'
      ? 'rgba(42, 20, 40, 0.98)'
      : 'rgba(35, 35, 35, 0.98)',
    // Full-width stacking only for AI chatbot, not human conversations
    ...(isconversation !== 'true' && {
      maxWidth: '100%',
      alignSelf: 'stretch',
    }),
  },
}));

const MessageIcon = styled(Box)(({ theme }) => ({
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(0.5),
}));



const MessageBubble = ({ message, isFirstMessage, isConversation = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Skip animation on mobile to avoid jank when loading message history
  const fadeTimeout = isMobile ? 0 : 600;
  return (
    <Fade in timeout={fadeTimeout}>
      <MessageBubbleContainer
        isuser={message.isUser.toString()}
        isfirstmessage={isFirstMessage ? 'true' : 'false'}
        isconversation={isConversation ? 'true' : 'false'}
      >
        <MessageIcon>
          {message.isUser ? (
            <PersonIcon sx={{ color: 'rgba(156, 39, 176, 0.8)' }} />
          ) : isConversation ? (
            <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
          ) : (
            <SmartToyIcon sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
          )}
        </MessageIcon>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body1" 
            component="div"
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6,
              '& strong': { 
                fontWeight: 'bold',
                color: 'rgba(156, 39, 176, 0.9)'
              }
            }}
          >
            {formatMessageText(message.text, message.id === 1)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5 }}>
            {new Date(message.timestamp).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })} at {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
      </MessageBubbleContainer>
    </Fade>
  );
};

export default MessageBubble;