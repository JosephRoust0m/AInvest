import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  conversations: [],
}

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload
    },
    clearConversations: (state) => {
      state.conversations = []
    },
    openConversation: (state, action) => {
      // payload: convoId
      const convo = state.conversations.find(c => c.id === action.payload)
      if (convo) {
        convo.open = true
        convo.unreadCount = 0
      }
    },
    closeConversation: (state, action) => {
      // payload: { convoId, userType }
      const { convoId, userType } = action.payload
      const convo = state.conversations.find(c => c.id === convoId)
      if (convo) {
        convo.open = false
        const now = Date.now()
        if (userType === 'advisor') {
          convo.last_closed_advisor = now
        } else {
          convo.last_closed_user = now
        }
      }
    },
  },
})

export const { setConversations, clearConversations, openConversation, closeConversation } = conversationsSlice.actions
export default conversationsSlice.reducer
