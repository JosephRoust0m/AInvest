import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import FeatureToggle from '../../components/FeatureToggle';
import ChatMessagesArea from '../../components/ChatMessagesArea';
import ChatInput from '../../components/ChatInput';
import StockPredictor from '../../components/StockPredictor';
import ChatAPI from '../../api/ChatAPI';


const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #2a1428 70%, #000000 100%)',
  margin: 0,
  padding: 0,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  top: 0,
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(74, 20, 140, 0.1) 0%, transparent 70%), radial-gradient(circle at 70% 80%, rgba(45, 45, 45, 0.2) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: -1,
  },
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 64px)', // Account for navbar height only
  width: '100%',
  padding: theme.spacing(2),
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  width: '100%',
  maxWidth: '900px',
}));

const FeatureContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
}));

const FinancialChatbot = () => {
  const { user } = useSelector(state => state.auth);
  // Initialize expert messaging system on this page to ensure last logout time is fetched and stored
  const [activeFeature, setActiveFeature] = useState('chatbot');
  const [messages, setMessages] = useState([]);

  // Initialize greeting message with proper username
  useEffect(() => {
    const username = user?.username || localStorage.getItem('username') || 'User';
    setMessages([{
      id: 1,
      text: `Hello ${username}! I'm your AI Financial Assistant. I can help you with stock analysis, market insights, and investment advice. How can I assist you today?`,
      isUser: false,
      timestamp: new Date(),
      isTyping: false
    }]);
  }, [user?.username]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const featureOptions = [
    { value: 'chatbot', label: 'AI Chatbot' },
    { value: 'predictor', label: 'Stock Predictor' }
  ];

  const handleFeatureChange = (event, newFeature) => {
    if (newFeature !== null) {
      setActiveFeature(newFeature);
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const result = await ChatAPI.sendMessage(inputText, messages.slice(-5));
      
      const responseText = result.success ? result.response : result.error;
      const botMessage = {
        id: Date.now() + 1,
        text: '',
        fullText: responseText,
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Type out the response character by character
      const typeResponse = () => {
        let currentText = '';
        
        for (let i = 0; i < responseText.length; i++) {
          setTimeout(() => {
            currentText += responseText[i];
            console.log('Typing character:', currentText); // Debug log
            
            setMessages(prev => prev.map(msg => 
              msg.id === botMessage.id 
                ? { ...msg, text: currentText, isTyping: i < responseText.length - 1 }
                : msg
            ));
          }, i * 30); // Simplified timing
        }
      };
      
      typeResponse();
    } catch (error) {
      console.error('Unexpected error:', error);
      
      const errorText = "An unexpected error occurred. Please try again.";
      const errorMessage = {
        id: Date.now() + 1,
        text: '',
        fullText: errorText,
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => [...prev, errorMessage]);
      
      // Type out the error message
      const typeError = () => {
        let currentText = '';
        
        for (let i = 0; i < errorText.length; i++) {
          setTimeout(() => {
            currentText += errorText[i];
            
            setMessages(prev => prev.map(msg => 
              msg.id === errorMessage.id 
                ? { ...msg, text: currentText, isTyping: i < errorText.length - 1 }
                : msg
            ));
          }, i * 30); // Simplified timing
        }
      };
      
      typeError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <ChatContainer>
        <ContentContainer>
          <PageTitle>
            Financial AI Assistant
          </PageTitle>

          <FeatureToggle
            value={activeFeature}
            onChange={handleFeatureChange}
            options={featureOptions}
          />

          <FeatureContent>
            {activeFeature === 'chatbot' ? (
              <>
                <ChatMessagesArea 
                  messages={messages} 
                  loading={loading} 
                />

                <ChatInput
                  inputText={inputText}
                  onInputChange={handleInputChange}
                  onSend={sendMessage}
                  loading={loading}
                />
              </>
            ) : (
              <StockPredictor />
            )}
          </FeatureContent>
        </ContentContainer>
      </ChatContainer>
    </PageWrapper>
  );
};

export default FinancialChatbot;