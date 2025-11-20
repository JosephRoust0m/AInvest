import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ExpertAPI from '../api/ExpertAPI';
import AuthAPI from '../api/AuthAPI';
import {
  loadAllConversations,
  setConversationActive,
  setConversationInactive,
  addMessage,
  saveConversationSuccess,
  clearUnreadCount,
  setUnreadCounts,
  startPolling,
  stopPolling,
  resetState
} from '../store/expertMessagesSlice';
import { setLastLogout } from '../store/authSlice';

export const useExpertUserMessaging = () => {
  const dispatch = useDispatch();
  const { user, userType } = useSelector(state => state.auth);
  const { 
    activeDialog, 
    conversations, 
    unreadCounts, 
    isPolling, 
    lastPollTime,
    isInitialized
  } = useSelector(state => state.expertMessages);

  const expertAPI = ExpertAPI;
  const authAPI = AuthAPI;

  // Initialize messaging system for expert on login
  const initializeExpertMessaging = useCallback(async () => {
    console.log('initializeExpertMessaging called:', { 
      username: user?.username,
      userType
    });
    
    if (!user?.username || userType !== 'expert') {
      console.log('initializeExpertMessaging skipped - not an expert or no username');
      return;
    }

    try {
      // Fetch and store expert's last logout time
      console.log('Fetching expert last logout time...');
      const lastLogoutResult = await authAPI.getExpertLastLogout(user.username);
      console.log('Expert last logout API result:', lastLogoutResult);
      if (lastLogoutResult.success && lastLogoutResult.lastLogout) {
        console.log('Dispatching expert setLastLogout with:', lastLogoutResult.lastLogout);
        dispatch(setLastLogout(lastLogoutResult.lastLogout));
        console.log('Stored expert last logout time in Redux:', lastLogoutResult.lastLogout);
      } else {
        console.log('No expert last logout time found or API failed:', lastLogoutResult);
      }
      
      // Start polling for conversations immediately
      console.log('Starting expert polling...');
      dispatch(startPolling());
      console.log('Expert polling started');
      
      // Fetch conversations immediately on login
      console.log('Fetching initial expert conversations...');
      await pollForExpertConversations();
      
    } catch (error) {
      console.error('Error initializing expert messaging:', error);
    }
  }, [user?.username, userType, dispatch]);

  // Poll for all conversations for the expert
  const pollForExpertConversations = useCallback(async () => {
    console.log('pollForExpertConversations called - expert check:', {
      hasUsername: !!user?.username,
      isExpert: userType === 'expert',
      isPolling
    });
    
    if (!user?.username || userType !== 'expert') {
      console.log('Expert polling stopped due to conditions:', { 
        username: user?.username, 
        userType
      });
      return;
    }

    try {
      console.log('Fetching all conversations for expert:', user.username);
      // Use the expert-specific endpoint to get all conversations they're involved in
      const result = await expertAPI.getAllExpertConversations(user.username);
      
      if (result.success) {
        console.log('Received expert conversations:', result.conversations);
        
        // Process conversations from expert's perspective - each conversation is with a user
        const processedConversations = (result.conversations || []).map(conv => {
          // For experts, the "other party" is the user, not the expert
          // Extract the user from the conversation messages
          const userMessages = conv.conversation?.filter(msg => msg.sender !== user.username) || [];
          const userName = userMessages.length > 0 ? userMessages[0].sender : 'Unknown User';
          
          return {
            expertUsername: userName, // For experts, this represents the user they're chatting with
            messages: (conv.conversation || []).map(msg => ({
              id: msg.id,
              sender: msg.sender,
              message: msg.message,
              timestamp: msg.timestamp
            })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
            lastUpdated: new Date().toISOString(),
            isActive: false
          };
        });
        
        console.log('Processed expert conversations:', processedConversations);
        dispatch(loadAllConversations(processedConversations));
        
        // Get expert's last logout time from Redux
        const lastLogoutTime = user?.lastLogout;
        console.log('Expert object from Redux:', user);
        console.log('Using expert last logout time from Redux:', lastLogoutTime);
        console.log('Processing conversations for unread count:', processedConversations);
        
        // Calculate unread counts based on expert's last logout time
        const newUnreadCounts = {};
        
        processedConversations.forEach(conversation => {
          console.log('Processing conversation for unread count:', conversation);
          const userName = conversation.expertUsername;
          const isDialogOpen = activeDialog === userName;
          
          if (!isDialogOpen) {
            // Count messages from users that arrived after expert's last logout
            const unreadCount = conversation.messages.filter(msg => {
              // Message must be from user (not from this expert)
              const isFromUser = msg.sender === userName;
              
              if (!isFromUser) return false;
              
              // If no logout time recorded, consider all user messages as unread
              if (!lastLogoutTime) return true;
              
              // Only count messages that arrived after the expert's last logout
              return new Date(msg.timestamp) > new Date(lastLogoutTime);
            }).length;
            
            newUnreadCounts[userName] = unreadCount;
          } else {
            newUnreadCounts[userName] = 0; // Dialog is open, no unread messages
          }
        });
        
        dispatch(setUnreadCounts(newUnreadCounts));
        console.log('Updated expert unread counts based on last logout:', newUnreadCounts);
        
      } else {
        console.error('Failed to fetch expert conversations:', result.error);
      }
      
    } catch (error) {
      console.error('Error polling for expert conversations:', error);
    }
  }, [user?.username, user?.lastLogout, userType, conversations, activeDialog, dispatch, expertAPI]);

  // Open conversation with a user (from expert's perspective)
  const openUserConversation = useCallback(async (userName) => {
    if (!user?.username || userType !== 'expert') return;

    try {
      // Set conversation as active in Redux
      dispatch(setConversationActive(userName));
    } catch (error) {
      console.error('Error opening user conversation:', error);
    }
  }, [user?.username, userType, dispatch]);

  // Send message to user (from expert's perspective)
  const sendMessageToUser = useCallback(async (userName, message) => {
    if (!user?.username || userType !== 'expert') return { success: false };

    try {
      // Expert sends message - use the same endpoint but with expert as sender
      const result = await expertAPI.sendMessageToExpert(user.username, message, userName);
      
      if (result.success) {
        // Add message to Redux state
        const messageData = {
          id: Date.now(), // Temporary ID until real one comes from backend
          sender: user.username,
          message: message,
          timestamp: new Date().toISOString()
        };
        
        dispatch(addMessage({ expertUsername: userName, message: messageData }));
      }
      
      return result;
    } catch (error) {
      console.error('Error sending message to user:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }, [user?.username, userType, dispatch, expertAPI]);

  // Close conversation and save to database (from expert's perspective)
  const closeUserConversation = useCallback(async (userName) => {
    if (!user?.username || userType !== 'expert' || !conversations[userName]) return;

    try {
      // Save conversation to database
      const messages = conversations[userName].messages;
      if (messages.length > 0) {
        const result = await expertAPI.saveConversation(userName, user.username, messages);
        
        if (result.success) {
          dispatch(saveConversationSuccess({ 
            expertUsername: userName, 
            conversationId: result.conversationId 
          }));
        }
      }
      
      // Set conversation as inactive
      dispatch(setConversationInactive(userName));
      
    } catch (error) {
      console.error('Error closing user conversation:', error);
    }
  }, [user?.username, userType, conversations, dispatch, expertAPI]);

  // Clear unread count when opening dialog
  const markMessagesAsRead = useCallback((userName) => {
    dispatch(clearUnreadCount({ expertUsername: userName }));
  }, [dispatch]);

  // Setup polling interval
  useEffect(() => {
    console.log('Expert polling useEffect triggered:', { isPolling, hasUsername: !!user?.username, userType });
    let interval;
    
    if (isPolling && user?.username && userType === 'expert') {
      console.log('Setting up expert polling interval...');
      interval = setInterval(pollForExpertConversations, 10000); // Poll every 10 seconds
      console.log('Expert polling interval set');
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPolling, user?.username, userType, pollForExpertConversations]);

  // Handle logout - save all conversations and reset state
  const handleExpertLogout = useCallback(async () => {
    if (!user?.username || userType !== 'expert') return;

    try {
      // Save all active conversations
      const savePromises = Object.entries(conversations).map(async ([userName, conversation]) => {
        if (conversation.messages.length > 0) {
          return expertAPI.saveConversation(userName, user.username, conversation.messages);
        }
      });
      
      await Promise.all(savePromises.filter(Boolean));
      
      // Update expert last logout time using expert endpoint
      await authAPI.sendExpertLogoutTimestamp(user.username);
    
      // Reset Redux state
      dispatch(resetState());
      
    } catch (error) {
      console.error('Error handling expert logout:', error);
    }
  }, [user?.username, userType, conversations, dispatch, expertAPI, authAPI]);

  // Initialize on component mount
  useEffect(() => {
    if (user?.username && userType === 'expert') {
      initializeExpertMessaging();
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(stopPolling());
    };
  }, [user?.username, userType, initializeExpertMessaging, dispatch]);

  return {
    conversations,
    unreadCounts,
    activeDialog,
    isPolling,
    isInitialized,
    openUserConversation,
    closeUserConversation,
    sendMessageToUser,
    markMessagesAsRead,
    handleExpertLogout,
    initializeExpertMessaging
  };
};

export default useExpertUserMessaging;