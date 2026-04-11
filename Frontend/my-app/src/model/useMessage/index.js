import ApiGatewayService from '../../api/ApiGatewayService';
import { useDispatch, useSelector } from 'react-redux';
import { setConversations } from '../../store/conversationsSlice';
import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

const useMessage = () => {
  const dispatch = useDispatch();
  const conversations = useSelector(state => state.conversations.conversations);
  const username = useSelector(state => state.auth.user?.username);
  const userType = useSelector(state => state.auth.userType);
  const lastLogout = useSelector(state => state.auth.lastLogout);
  const activeChat = useSelector(state => state.activeChats.activeChats);
  const activeChatSender = useRef(activeChat);
  const refConversations = useRef(conversations);
  const { getToken } = useAuth();

  useEffect(() => {
    refConversations.current = conversations;
    activeChatSender.current = activeChat;
  }, [conversations, activeChat]);

  useEffect(() => {
    if (!username) return;
    const ws = new WebSocket('wss://chatting-microservice.onrender.com/ws' + '?username=' + username);

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      const sender = messageData.sender;
      const receiver = messageData.receiver;
      let convo = refConversations.current.find(
        c => (c.user_username === receiver && c.advisor_username === sender) || (c.user_username === sender && c.advisor_username === receiver)
      );
      if (!convo) {
        createConversation({
          user_username: userType === 'advisor' ? sender : receiver,
          advisor_username: userType === 'advisor' ? receiver : sender,
          message: messageData,
          direction: 'incoming',
        });
      } else {
        addMessage(convo.id, messageData, 'incoming');
      }
    };

    return () => {
      ws.close();
    };
  }, [username]);

  const createConversation = ({ user_username, advisor_username, message, direction }) => {
    const newConvo = {
      id: Math.floor(Math.random() * 1000000),
      user_username,
      advisor_username,
      conversation: [message],
      unreadCount: (message.receiver === username && message.sender !== activeChatSender.current) ? 1 : 0,
    };
    if (direction === 'outgoing') {
      getToken().then(token => {
        ApiGatewayService.sendMessage(message, token).catch(err => console.error('Send message error:', err));
      });
    }
    dispatch(setConversations([...refConversations.current, newConvo]));
    window.dispatchEvent(new Event('conversations-updated'));
    return newConvo;
  };

  const addMessage = (convoId, message, direction) => {
    const updatedConvos = refConversations.current.map(convo => {
      if (convo.id === convoId) {
        if (direction === 'outgoing') {
          getToken().then(token => {
            ApiGatewayService.sendMessage(message, token).catch(err => console.error('Send message error:', err));
          });
        }
        return {
          ...convo,
          conversation: [...convo.conversation, message],
          unreadCount: (message.receiver === username && message.sender !== activeChatSender.current)
            ? convo.unreadCount + 1
            : convo.unreadCount,
        };
      }
      return convo;
    });
    dispatch(setConversations(updatedConvos));
    window.dispatchEvent(new Event('conversations-updated'));
  };

  const countUnreadMessages = (convo) => {
    if (!lastLogout) return 0;
    return convo.conversation.filter(
      msg => new Date(msg.timestamp) > new Date(lastLogout) && msg.receiver === username
    ).length;
  };

  const clearUnreadCount = (convoId) => {
    const updatedConvos = refConversations.current.map(convo => {
      if (convo.id === convoId) {
        return { ...convo, unreadCount: 0 };
      }
      return convo;
    });
    dispatch(setConversations(updatedConvos));
  };

  return {
    createConversation,
    clearUnreadCount,
    addMessage,
    countUnreadMessages,
  };
};

export default useMessage;
