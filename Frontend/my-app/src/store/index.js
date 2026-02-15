import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './authSlice'
import conversationsReducer from './conversationsSlice'
import advisorsReducer from './advisorsSlice'
import activeChatsReducer from './activeChatsSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  conversations: conversationsReducer,
  advisors: advisorsReducer,
  activeChats: activeChatsReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'conversations', 'advisors', 'activeChats'], 
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
})

export const persistor = persistStore(store)
