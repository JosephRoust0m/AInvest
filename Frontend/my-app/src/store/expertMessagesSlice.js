import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeDialog: null, // Currently open expert dialog
  conversations: {}, // Full conversations keyed by expert username: { expertUsername: { messages: [], lastUpdated: string, conversationId: string, isActive: boolean } }
  unreadCounts: {}, // Unread message counts keyed by expert username
  lastDialogCloseTimes: {}, // Last close time for each expert dialog keyed by expert username
  pollingInterval: null, // Store polling interval ID
  lastPollTime: null, // Track last poll time
  isInitialized: false, // Track if conversations have been loaded from database
  isPolling: false // Track if polling is active
}

const expertMessagesSlice = createSlice({
  name: 'expertMessages',
  initialState,
  reducers: {
    setActiveDialog: (state, action) => {
      state.activeDialog = action.payload // expert username
    },
    clearActiveDialog: (state) => {
      state.activeDialog = null
    },
    loadAllConversations: (state, action) => {
      // Load conversations from database on login
      const conversations = action.payload
      state.conversations = {}
      
      conversations.forEach(conv => {
        state.conversations[conv.expertUsername] = {
          messages: conv.messages || [],
          lastUpdated: conv.lastUpdated,
          conversationId: conv.conversationId || conv.id,
          isActive: false
        }
      })
      
      state.isInitialized = true
    },
    setConversationActive: (state, action) => {
      const expertUsername = action.payload
      if (state.conversations[expertUsername]) {
        state.conversations[expertUsername].isActive = true
      } else {
        // Create new conversation if it doesn't exist
        state.conversations[expertUsername] = {
          messages: [],
          lastUpdated: new Date().toISOString(),
          conversationId: null,
          isActive: true
        }
      }
    },
    setConversationInactive: (state, action) => {
      const expertUsername = action.payload
      if (state.conversations[expertUsername]) {
        state.conversations[expertUsername].isActive = false
        state.conversations[expertUsername].lastUpdated = new Date().toISOString()
      }
    },
    addMessage: (state, action) => {
      const { expertUsername, message } = action.payload
      if (!state.conversations[expertUsername]) {
        state.conversations[expertUsername] = {
          messages: [],
          lastUpdated: new Date().toISOString(),
          conversationId: null,
          isActive: false
        }
      }
      state.conversations[expertUsername].messages.push(message)
      state.conversations[expertUsername].lastUpdated = new Date().toISOString()
    },
    addMessages: (state, action) => {
      const { expertUsername, messages } = action.payload
      if (!state.conversations[expertUsername]) {
        state.conversations[expertUsername] = {
          messages: [],
          lastUpdated: new Date().toISOString(),
          conversationId: null,
          isActive: false
        }
      }
      state.conversations[expertUsername].messages = [...state.conversations[expertUsername].messages, ...messages]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      state.conversations[expertUsername].lastUpdated = new Date().toISOString()
    },
    saveConversationSuccess: (state, action) => {
      const { expertUsername, conversationId } = action.payload
      if (state.conversations[expertUsername]) {
        state.conversations[expertUsername].conversationId = conversationId
        state.conversations[expertUsername].lastUpdated = new Date().toISOString()
      }
    },
    clearConversation: (state, action) => {
      const expertUsername = action.payload
      if (state.conversations[expertUsername]) {
        state.conversations[expertUsername].messages = []
        state.conversations[expertUsername].lastUpdated = new Date().toISOString()
      }
    },
    calculateUnreadCounts: (state, action) => {
      const lastLogout = action.payload
      
      // Calculate unread counts based on messages since last logout
      Object.entries(state.conversations).forEach(([expertUsername, conversation]) => {
        const unreadCount = conversation.messages.filter(msg => {
          // Message is from expert if sender is not user email and not 'user' and doesn't contain '@'
          const isFromExpert = msg.sender && 
                              msg.sender !== 'user' && 
                              !msg.sender.includes('@') &&
                              msg.sender === expertUsername
          return isFromExpert && new Date(msg.timestamp) > new Date(lastLogout)
        }).length
        
        state.unreadCounts[expertUsername] = unreadCount
      })
    },
    setUnreadCount: (state, action) => {
      const { expertUsername, count } = action.payload
      state.unreadCounts[expertUsername] = count
    },
    incrementUnreadCount: (state, action) => {
      const { expertUsername } = action.payload
      if (!state.unreadCounts[expertUsername]) {
        state.unreadCounts[expertUsername] = 0
      }
      state.unreadCounts[expertUsername] += 1
    },
    clearUnreadCount: (state, action) => {
      const { expertUsername } = action.payload
      state.unreadCounts[expertUsername] = 0
    },
    setUnreadCounts: (state, action) => {
      state.unreadCounts = action.payload
    },
    startPolling: (state) => {
      state.isPolling = true
    },
    stopPolling: (state) => {
      state.isPolling = false
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval)
        state.pollingInterval = null
      }
    },
    setPollingInterval: (state, action) => {
      state.pollingInterval = action.payload
    },
    clearPollingInterval: (state) => {
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval)
        state.pollingInterval = null
      }
    },
    setLastPollTime: (state, action) => {
      state.lastPollTime = action.payload
    },
    setDialogCloseTime: (state, action) => {
      const { expertUsername, closeTime } = action.payload
      state.lastDialogCloseTimes[expertUsername] = closeTime
    },
    resetState: (state) => {
      return initialState
    }
  }
})

export const {
  setActiveDialog,
  clearActiveDialog,
  loadAllConversations,
  setConversationActive,
  setConversationInactive,
  addMessage,
  addMessages,
  saveConversationSuccess,
  clearConversation,
  calculateUnreadCounts,
  setUnreadCount,
  incrementUnreadCount,
  clearUnreadCount,
  setUnreadCounts,
  setDialogCloseTime,
  startPolling,
  stopPolling,
  setPollingInterval,
  clearPollingInterval,
  setLastPollTime,
  resetState
} = expertMessagesSlice.actions

export default expertMessagesSlice.reducer