import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/PageTitle';
import FeatureToggle from '../../components/FeatureToggle';
import ChatMessagesArea from '../../components/ChatMessagesArea';
import ChatInput from '../../components/ChatInput';
import StockPredictor from '../../components/StockPredictor';
import ApiGatewayService from '../../api/ApiGatewayService';
import { setMessages, addMessage, updateMessage } from '../../store/chatbotSlice';


const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
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
  width: '100%',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(4),
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
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chatbot.messages);
  const [activeFeature, setActiveFeature] = useState('chatbot');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const typingTimeoutsRef = useRef([]);

  // Set welcome message only on first load (empty messages)
  useEffect(() => {
    if (messages.length === 0) {
      const username = user?.username || 'User';
      dispatch(setMessages([{
        id: 1,
        text: `Hello ${username}! I'm your AI Financial Assistant. I can help you with stock analysis, market insights, and investment advice. How can I assist you today?`,
        isUser: false,
        timestamp: new Date().toISOString(),
        isTyping: false,
      }]));
    }
  }, []);

  // On unmount, complete any in-progress typing so it doesn't hang on return
  useEffect(() => {
    return () => {
      typingTimeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

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

  const typeText = (msgId, responseText) => {
    typingTimeoutsRef.current.forEach(id => clearTimeout(id));
    typingTimeoutsRef.current = [];
    let currentText = '';
    for (let i = 0; i < responseText.length; i++) {
      const timeoutId = setTimeout(() => {
        currentText += responseText[i];
        dispatch(updateMessage({
          id: msgId,
          updates: { text: currentText, isTyping: i < responseText.length - 1 },
        }));
      }, i * 8);
      typingTimeoutsRef.current.push(timeoutId);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInputText('');
    setLoading(true);

    try {
      const token = await getToken();
      const result = await ApiGatewayService.sendChatMessage(inputText, messages.slice(-5), token);

      const responseText = result.response || "I'm sorry, I couldn't process your request at the moment. Please try again.";
      const botMessage = {
        id: Date.now() + 1,
        text: '',
        fullText: responseText,
        isUser: false,
        timestamp: new Date().toISOString(),
        isTyping: true,
      };

      dispatch(addMessage(botMessage));
      typeText(botMessage.id, responseText);
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorText = "I can only answer finance related questions :)";
      const errorMessage = {
        id: Date.now() + 1,
        text: '',
        fullText: errorText,
        isUser: false,
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      dispatch(addMessage(errorMessage));
      typeText(errorMessage.id, errorText);
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
