import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
// import expertMessagesReducer from './expertMessagesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // expertMessages: expertMessagesReducer
  },
})