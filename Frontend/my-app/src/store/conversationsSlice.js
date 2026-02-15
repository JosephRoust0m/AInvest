import ConversationsAPI from '../api/ConversationsAPI';

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
    saveAllConversations: async (conversations) => {
    try {
      const result = await ConversationsAPI.saveConversations(conversations);
      return result;
    } catch (error) {
      console.error('Save conversations error:', error);
    }
    },
  },
})

export const { setConversations, clearConversations, saveAllConversations } = conversationsSlice.actions
export default conversationsSlice.reducer
