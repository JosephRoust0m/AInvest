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
  },
})

export const { setConversations, clearConversations } = conversationsSlice.actions
export default conversationsSlice.reducer
