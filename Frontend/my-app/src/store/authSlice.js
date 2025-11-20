import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  userType: 'user' // 'user' or 'expert'
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.user = {
        username: action.payload.username,
        email: action.payload.email,
      }
      state.token = action.payload.token
      state.userType = action.payload.userType || 'user'
    },
    expertLoginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.user = {
        username: action.payload.username,
        expertUsername: action.payload.username,
      }
      state.token = action.payload.token
      state.userType = 'expert'
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.userType = 'user'
    },
    setLastLogout: (state, action) => {
      if (state.user) {
        state.user.lastLogout = action.payload
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    }
  }
})

export const { loginSuccess, expertLoginSuccess, logout, updateUser, setLastLogout } = authSlice.actions
export default authSlice.reducer