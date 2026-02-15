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
import useMessage from '../../model/useMessage';
import MessageBubble from '../MessageBubble';

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

const AdvisorInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const AdvisorAvatar = styled(Avatar)(({ theme }) => ({
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

const AdvisorChatDialog = ({ advisor, open, onClose }) => {
  // Force update on global conversations-updated event
  useEffect(() => {
    const forceUpdate = () => setInputText(inputText => inputText);
    window.addEventListener('conversations-updated', forceUpdate);
    return () => window.removeEventListener('conversations-updated', forceUpdate);
  }, []);

  const conversations = useSelector(state => state.conversations.conversations);
  const { user } = useSelector(state => state.auth);
  const { createConversation, addMessage } = useMessage();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  //const refConversations = useRef(conversations);

  // useEffect(() => {
  //   refConversations.current = conversations;
  // }, [conversations]);

  // Find the conversation for this advisor and user
  const currentConvo = conversations.length > 0 ?
    conversations.find(
      convo => convo.advisor_username.includes(advisor?.username) && convo.user_username.includes(user?.username)
    ): null;
  const advisorMessages = currentConvo ? currentConvo.conversation : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [advisorMessages]);
  // Scroll to bottom when dialog opens
  useEffect(() => {
    if (open && advisorMessages.length > 0) {
      // Use setTimeout to ensure DOM is rendered before scrolling
      setTimeout(scrollToBottom, 100);
    }
  }, [open, advisorMessages.length]);



  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const sendMessage = () => {
    if (!inputText.trim() || loading || !advisor) return;
    const messageText = inputText.trim();
    setInputText('');
    setLoading(true);
    const message = {
      id: Math.floor(Math.random() * 1000000000),
      sender: user.username,
      receiver: advisor.username,
      timestamp: new Date().getTime(),
      text: messageText,
    };
    if (!currentConvo) {
      createConversation({
        user_username: user.username,
        advisor_username: advisor.username,
        message,
        direction: 'outgoing'
      });
    } else {
      addMessage(currentConvo.id, message, 'outgoing');
    }
    setLoading(false);
  };

  const handleClose = async () => {
    setInputText('');
    onClose();
  };
  // // Update dialog when conversations change (new message arrives/sent)
  // useEffect(() => {
  //   if (open) {
  //     setInputText(' '); // or any other state update to trigger UI refresh
  //   }
  // }, [conversations, open]);

  if (!advisor) return null;

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogHeader>
        <AdvisorInfo>
          <AdvisorAvatar>
            <PersonIcon sx={{ fontSize: 24, color: 'rgba(156, 39, 176, 0.8)' }} />
          </AdvisorAvatar>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Chat with {advisor.username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Financial Advisor
            </Typography>
          </Box>
        </AdvisorInfo>
        
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
          {advisorMessages.map((message, index) => (
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
            placeholder={`...`}
          />
        </Box>
      </ChatContent>
    </StyledDialog>
  );
};

export default AdvisorChatDialog;