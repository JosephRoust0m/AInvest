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
        username: action.payload?.username || '',
        email: action.payload?.email || '',
      }
      state.token = action.payload.token
      state.userType = action.payload.userType
    },

    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.userType = null
    },

    setLastLogout: (state, action) => {
      if (state.user) {
        state.user.lastLogout = action.payload
      }
    },
  }
})

export const { loginSuccess, logout, setLastLogout } = authSlice.actions
export default authSlice.reducer