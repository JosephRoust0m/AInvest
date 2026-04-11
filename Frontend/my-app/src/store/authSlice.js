import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  user: null,
  userType: 'user',
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
      state.userType = action.payload.userType || 'user'
    },

    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.userType = 'user'
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
