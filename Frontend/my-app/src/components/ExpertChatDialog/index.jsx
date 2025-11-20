import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  IconButton,
  Paper,
  Avatar,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import ChatInput from '../ChatInput';
import useExpertMessaging from '../../hooks/useExpertMessaging';
import MessageBubble from '../MessageBubble';
import ExpertAPI from '../../api/ExpertAPI';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #2a1428 70%, #000000 100%)',
    border: '1px solid rgba(156, 39, 176, 0.3)',
    borderRadius: theme.spacing(2),
    maxWidth: '600px',
    width: '90vw',
    height: '80vh',
    margin: theme.spacing(2),
  },
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'rgba(156, 39, 176, 0.1)',
  borderBottom: '1px solid rgba(156, 39, 176, 0.2)',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ExpertInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ExpertAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  background: 'linear-gradient(135deg, #2a1428 0%, #1a1a1a 100%)',
  border: '2px solid rgba(156, 39, 176, 0.3)',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(156, 39, 176, 0.3)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(156, 39, 176, 0.5)',
    },
  },
}));

const ChatContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(80vh - 80px)', // Subtract header height
}));

const ExpertChatDialog = ({ expert, open, onClose, username }) => {
  const { conversations } = useSelector(state => state.expertMessages);
  const { user } = useSelector(state => state.auth);
  const { sendMessageToExpert, closeExpertConversation } = useExpertMessaging();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get messages for the current expert from Redux conversations
  const expertMessages = expert && conversations[expert.username] 
    ? conversations[expert.username].messages 
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [expertMessages]);

  // Scroll to bottom when dialog opens
  useEffect(() => {
    if (open && expertMessages.length > 0) {
      // Use setTimeout to ensure DOM is rendered before scrolling
      setTimeout(scrollToBottom, 100);
    }
  }, [open, expertMessages.length]);



  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading || !expert) return;

    const messageText = inputText.trim();
    setInputText(''); // Clear input immediately
    setLoading(true);

    try {
      // Send message via Redux hook
      const result = await sendMessageToExpert(expert.username, messageText);
      
      if (!result.success) {
        console.error('Failed to send message:', result.error);
        // Optionally show error to user
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setInputText('');
    
    // Save conversation when closing dialog
    if (expert?.username) {
      await closeExpertConversation(expert.username);
    }
    
    onClose();
  };

  if (!expert) return null;

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogHeader>
        <ExpertInfo>
          <ExpertAvatar>
            <PersonIcon sx={{ fontSize: 24, color: 'rgba(156, 39, 176, 0.8)' }} />
          </ExpertAvatar>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Chat with {expert.username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Financial Expert
            </Typography>
          </Box>
        </ExpertInfo>
        
        <IconButton 
          onClick={handleClose}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'white',
              background: 'rgba(156, 39, 176, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <ChatContent>
        <MessagesContainer>
          {expertMessages.map((message, index) => (
            <MessageBubble 
              key={message.id || index} 
              message={{
                id: message.id,
                text: message.message || message.text,
                isUser: message.sender === user?.username,
                timestamp: new Date(message.timestamp),
                isTyping: false
              }} 
              isFirstMessage={false}
            />
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(156, 39, 176, 0.2)' }}>
          <ChatInput
            inputText={inputText}
            onInputChange={handleInputChange}
            onSend={sendMessage}
            loading={loading}
            placeholder={`Ask ${expert.username} about investments...`}
          />
        </Box>
      </ChatContent>
    </StyledDialog>
  );
};

export default ExpertChatDialog;