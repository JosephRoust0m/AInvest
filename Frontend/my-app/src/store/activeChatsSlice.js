import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeChats: null,
};

const activeChatsSlice = createSlice({
  name: 'activeChats',
  initialState,
  reducers: {
  openChat: (state, action) => {
    state.activeChats = action.payload;   // just set the username
  },
  closeChat: (state, action) => {
    if (state.activeChats === action.payload) {
      state.activeChats = null;           // clear it if it's the one being closed
    }
  },
    clearActiveChats: (state) => {
      state.activeChats = null;
    },
  },
});

export const { openChat, closeChat, clearActiveChats } = activeChatsSlice.actions;
export default activeChatsSlice.reducer;
