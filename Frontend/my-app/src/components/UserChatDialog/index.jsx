import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar
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
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      margin: 0,
      width: '100vw',
      maxWidth: '100vw',
      height: '-webkit-fill-available',
      maxHeight: '-webkit-fill-available',
      display: 'flex',
      flexDirection: 'column',
    },
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
  height: 'calc(80vh - 80px)',
  [theme.breakpoints.down('sm')]: {
    flex: 1,
    height: 0,
    overflow: 'hidden',
  },
}));

const UserChatDialog = ({ selectedUser, open, onClose }) => {
  // Force update on global conversations-updated event
  useEffect(() => {
    const forceUpdate = () => setInputText(inputText => inputText);
    window.addEventListener('conversations-updated', forceUpdate);
    return () => window.removeEventListener('conversations-updated', forceUpdate);
  }, []);

  const conversations = useSelector(state => state.conversations.conversations);
  const advisor = useSelector(state => state.auth.user);
  const { addMessage } = useMessage();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentConvo = conversations.length > 0 ?     
  conversations.find(
    convo => convo.user_username.includes(selectedUser?.username) && convo.advisor_username.includes(advisor?.username)
  ) : null;
  const userMessages = currentConvo ? currentConvo.conversation : [];

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

  const sendMessage = () => {
    if (!inputText.trim() || loading || !selectedUser) return;
    const messageText = inputText.trim();
    setInputText('');
    setLoading(true);
    const message = {
      id: Math.floor(Math.random() * 1000000000),
      sender: advisor.username,
      receiver: selectedUser.username,
      timestamp: new Date().getTime(),
      text: messageText,
    };
      addMessage(currentConvo.id, message, 'outgoing');
    setLoading(false);
  };

  const handleClose = () => {
    setInputText('');
    onClose();
  };
    // Update dialog when conversations change (new message arrives/sent)

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
              Chat with {selectedUser.username}
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
                isUser: message.sender === advisor?.username,
                timestamp: new Date(message.timestamp),
                isTyping: false
              }}
              isFirstMessage={false}
              isConversation={true}
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