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
import useExpertUserMessaging from '../../hooks/useExpertUserMessaging';
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

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
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

const UserChatDialog = ({ user: selectedUser, open, onClose }) => {
  const { conversations } = useSelector(state => state.expertMessages);
  const { user } = useSelector(state => state.auth);
  const { sendMessageToUser, closeUserConversation } = useExpertUserMessaging();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get messages for the current user from Redux conversations
  const userMessages = selectedUser && conversations[selectedUser.username] 
    ? conversations[selectedUser.username].messages 
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);

  // Scroll to bottom when dialog opens
  useEffect(() => {
    if (open && userMessages.length > 0) {
      // Use setTimeout to ensure DOM is rendered before scrolling
      setTimeout(scrollToBottom, 100);
    }
  }, [open, userMessages.length]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading || !selectedUser) return;

    const messageText = inputText.trim();
    setInputText(''); // Clear input immediately
    setLoading(true);

    try {
      // Send message via Redux hook (expert sending to user)
      const result = await sendMessageToUser(selectedUser.username, messageText);
      
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
    if (selectedUser?.username) {
      await closeUserConversation(selectedUser.username);
    }
    
    onClose();
  };

  if (!selectedUser) return null;

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogHeader>
        <UserInfo>
          <UserAvatar>
            <PersonIcon sx={{ fontSize: 24, color: 'rgba(156, 39, 176, 0.8)' }} />
          </UserAvatar>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Chat with {selectedUser.username || selectedUser.name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Investor
            </Typography>
          </Box>
        </UserInfo>
        
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
          {userMessages.map((message, index) => (
            <MessageBubble 
              key={message.id || index} 
              message={{
                id: message.id,
                text: message.message || message.text,
                isUser: message.sender === user?.username, // For experts, they are the "user" in this context
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
            placeholder={`Respond to ${selectedUser.username || 'user'}...`}
          />
        </Box>
      </ChatContent>
    </StyledDialog>
  );
};

export default UserChatDialog;