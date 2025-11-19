import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/Auth'
import FinancialChatbot from './pages/FinancialChatbot'
import ExpertConsultation from './pages/ExpertConsultation'
import ExpertDashboard from './pages/ExpertDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { loginSuccess, expertLoginSuccess } from './store/authSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = localStorage.getItem('authToken')
    const storedUsername = localStorage.getItem('username')
    const userType = localStorage.getItem('userType') || 'user'
    
    if (token) {
      console.log('Found stored token, restoring session');
      
      if (userType === 'expert') {
        // Restore expert session
        dispatch(expertLoginSuccess({
          username: storedUsername || 'Expert',
          token: token
        }))
      } else {
        // Restore user session
        dispatch(loginSuccess({
          username: storedUsername || 'User',
          email: 'user@example.com',
          token: token,
          userType: 'user'
        }))
      }
    }
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <FinancialChatbot />
          </ProtectedRoute>
        } />
        <Route path="/experts" element={
          <ProtectedRoute>
            <ExpertConsultation />
          </ProtectedRoute>
        } />
        <Route path="/expert-dashboard" element={
          <ProtectedRoute>
            <ExpertDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
