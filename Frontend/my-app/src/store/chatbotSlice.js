import { createSlice } from '@reduxjs/toolkit';

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    messages: [],
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const { id, updates } = action.payload;
      const msg = state.messages.find(m => m.id === id);
      if (msg) Object.assign(msg, updates);
    },
  },
});

export const { setMessages, addMessage, updateMessage } = chatbotSlice.actions;
export default chatbotSlice.reducer;
