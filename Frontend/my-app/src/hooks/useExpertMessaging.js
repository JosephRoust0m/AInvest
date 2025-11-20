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
  calculateUnreadCounts,
  clearUnreadCount,
  setUnreadCounts,
  setDialogCloseTime,
  startPolling,
  stopPolling,
  resetState
} from '../store/expertMessagesSlice';
import { setLastLogout } from '../store/authSlice';

export const useExpertMessaging = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    activeDialog, 
    conversations, 
    unreadCounts, 
    isPolling, 
    lastPollTime,
    isInitialized,
    lastDialogCloseTimes
  } = useSelector(state => state.expertMessages);

  const expertAPI = ExpertAPI;
  const authAPI = AuthAPI;

  // Initialize messaging system on login - start polling immediately
  const initializeMessaging = useCallback(async () => {
    console.log('initializeMessaging called:', { 
      username: user?.username
    });
    
    if (!user?.username) {
      console.log('initializeMessaging skipped - no username');
      return;
    }

    try {
      // Fetch and store user's last logout time
      console.log('Fetching user last logout time...');
      const lastLogoutResult = await authAPI.getUserLastLogout(user.username);
      console.log('Last logout API result:', lastLogoutResult);
      if (lastLogoutResult.success && lastLogoutResult.lastLogout) {
        console.log('Dispatching setLastLogout with:', lastLogoutResult.lastLogout);
        dispatch(setLastLogout(lastLogoutResult.lastLogout));
        console.log('Stored last logout time in Redux:', lastLogoutResult.lastLogout);
      } else {
        console.log('No last logout time found or API failed:', lastLogoutResult);
      }
      
      // Fetch conversations immediately on login
      console.log('Fetching initial conversations...');
      await pollForConversations();
      
      // Start polling for conversations
      console.log('Starting polling...');
      dispatch(startPolling());
      console.log('Polling started');
      
    } catch (error) {
      console.error('Error initializing messaging:', error);
    }
  }, [user?.username, dispatch]);

  // Poll for all conversations every 5 seconds
  const pollForConversations = useCallback(async () => {
    console.log('pollForConversations called - user check:', {
      hasUsername: !!user?.username,
      isPolling
    });
    
    if (!user?.username || !isPolling) {
      console.log('Polling stopped due to conditions:', { 
        username: user?.username, 
        isPolling
      });
      return;
    }

    try {
      console.log('Fetching all conversations for user:', user.username);
      const result = await expertAPI.getAllUserConversations(user.username);
      
      if (result.success) {
        console.log('Received conversations:', result.conversations);
        
        // Process conversations directly from API response
        const processedConversations = (result.conversations || []).map(conv => ({
          expertUsername: conv.expert_username,
          messages: (conv.conversation || []).map(msg => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.timestamp
          })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)), // Sort by timestamp: oldest first
          lastUpdated: new Date().toISOString(),
          isActive: false
        }));
        
        console.log('Processed conversations:', processedConversations);
        dispatch(loadAllConversations(processedConversations));
        
        // Get user's last logout time from Redux
        const lastLogoutTime = user?.lastLogout;
        console.log('User object from Redux:', user);
        console.log('Using last logout time from Redux:', lastLogoutTime);
        
        // Calculate unread counts based on last logout time
        const newUnreadCounts = {};
        
        processedConversations.forEach(conversation => {
          const expertUsername = conversation.expertUsername;
          const isDialogOpen = activeDialog === expertUsername;
          
          if (!isDialogOpen) {
            // Count messages from expert that arrived after last logout
            const unreadCount = conversation.messages.filter(msg => {
              // Message must be from expert (not from current user)
              const isFromExpert = msg.sender === expertUsername;
              
              if (!isFromExpert) return false;
              
              // If no logout time recorded, consider all expert messages as unread
              if (!lastLogoutTime) return true;
              
              // Only count messages that arrived after the last logout
              return new Date(msg.timestamp) > new Date(lastLogoutTime);
            }).length;
            
            newUnreadCounts[expertUsername] = unreadCount;
          } else {
            newUnreadCounts[expertUsername] = 0; // Dialog is open, no unread messages
          }
        });
        
        dispatch(setUnreadCounts(newUnreadCounts));
        console.log('Updated unread counts based on last logout:', newUnreadCounts);
        
      } else {
        console.error('Failed to fetch conversations:', result.error);
      }
      
    } catch (error) {
      console.error('Error polling for conversations:', error);
    }
  }, [user?.username, user?.lastLogout, isPolling, conversations, activeDialog, dispatch, expertAPI, authAPI]);

  // Open conversation with an expert
  const openExpertConversation = useCallback(async (expertUsername) => {
    if (!user?.username) return;

    try {
      // Set conversation as active in Redux
      // Messages are already loaded from the polling, no need to fetch individually
      dispatch(setConversationActive(expertUsername));
    } catch (error) {
      console.error('Error opening expert conversation:', error);
    }
  }, [user?.username, dispatch]);

  // Send message to expert
  const sendMessageToExpert = useCallback(async (expertUsername, message) => {
    if (!user?.username) return { success: false };

    try {
      const result = await expertAPI.sendMessageToExpert(expertUsername, message, user.username);
      
      if (result.success) {
        // Add message to Redux state
        const messageData = {
          id: Date.now(), // Temporary ID until real one comes from backend
          sender: user.username,
          message: message,
          timestamp: new Date().toISOString()
        };
        
        dispatch(addMessage({ expertUsername, message: messageData }));
      }
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }, [user?.username, dispatch, expertAPI]);

  // Close conversation and save to database
  const closeExpertConversation = useCallback(async (expertUsername) => {
    if (!user?.username || !conversations[expertUsername]) return;

    try {
      // Record the time when this dialog is being closed
      const closeTime = new Date().toISOString();
      dispatch(setDialogCloseTime({ expertUsername, closeTime }));
      
      // Save conversation to database
      const messages = conversations[expertUsername].messages;
      if (messages.length > 0) {
        const result = await expertAPI.saveConversation(user.username, expertUsername, messages);
        
        if (result.success) {
          dispatch(saveConversationSuccess({ 
            expertUsername, 
            conversationId: result.conversationId 
          }));
        }
      }
      
      // Set conversation as inactive
      dispatch(setConversationInactive(expertUsername));
      
      // Update user's last logout time for unread calculation
      dispatch(setLastLogout(new Date().toISOString()));
      
    } catch (error) {
      console.error('Error closing expert conversation:', error);
    }
  }, [user?.username, conversations, dispatch, expertAPI]);

  // Clear unread count when opening dialog
  const markMessagesAsRead = useCallback((expertUsername) => {
    dispatch(clearUnreadCount({ expertUsername }));
  }, [dispatch]);

  // Setup polling interval
  useEffect(() => {
    console.log('Polling useEffect triggered:', { isPolling, hasUsername: !!user?.username });
    let interval;
    
    if (isPolling && user?.username) {
      console.log('Setting up polling interval...');
      interval = setInterval(pollForConversations, 15000); // Poll every 15 seconds
      console.log('Polling interval set');
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPolling, user?.username, pollForConversations]);

  // Handle logout - save all conversations and reset state
  const handleLogout = useCallback(async () => {
    if (!user?.username) return;

    try {
      // Save all active conversations
      const savePromises = Object.entries(conversations).map(async ([expertUsername, conversation]) => {
        if (conversation.messages.length > 0) {
          return expertAPI.saveConversation(user.username, expertUsername, conversation.messages);
        }
      });
      
      await Promise.all(savePromises.filter(Boolean));
      
      // Update last logout time
      await authAPI.sendLogoutTimestamp(user.username);
    
      // Reset Redux state
      dispatch(resetState());
      
    } catch (error) {
      console.error('Error handling logout:', error);
    }
  }, [user?.username, conversations, dispatch, expertAPI]);

  // Initialize on component mount
  useEffect(() => {
    if (user?.username) {
      initializeMessaging();
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(stopPolling());
    };
  }, [user?.username, initializeMessaging, dispatch]);

  // Helper function to determine if a message is from an expert
  const isMessageFromExpert = useCallback((message, username) => {
    if (!message.sender) return false;
    
    // Message is from expert if:
    // 1. Sender is not the user's username
    // 2. Sender is not the generic 'user' string
    // 3. Sender is different from the current user
    return message.sender !== username && 
           message.sender !== 'user';
  }, []);

  // Helper function to standardize message format
  const standardizeMessage = useCallback((message, userEmail) => {
    return {
      ...message,
      isFromExpert: isMessageFromExpert(message, userEmail),
      isFromUser: message.sender === userEmail || message.sender === 'user'
    };
  }, [isMessageFromExpert]);

  // Helper function to mark dialog as closed (for direct use by components)
  const markDialogAsClosed = useCallback((expertUsername) => {
    const closeTime = new Date().toISOString();
    dispatch(setDialogCloseTime({ expertUsername, closeTime }));
  }, [dispatch]);

  return {
    conversations,
    unreadCounts,
    activeDialog,
    isPolling,
    isInitialized,
    openExpertConversation,
    closeExpertConversation,
    sendMessageToExpert,
    markMessagesAsRead,
    markDialogAsClosed,
    handleLogout,
    initializeMessaging,
    isMessageFromExpert,
    standardizeMessage
  };
};

export default useExpertMessaging;