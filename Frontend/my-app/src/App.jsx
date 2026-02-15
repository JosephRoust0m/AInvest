import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/Auth'
import FinancialChatbot from './pages/FinancialChatbot'
import ProtectedRoute from './components/ProtectedRoute'
import AdvisorContacts from './pages/AdvisorContacts'
import AdvisorsConsultation from './pages/AdvisorsConsultation'
import './App.css'


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <FinancialChatbot />
          </ProtectedRoute>
        } />
        <Route
          path="/advisor-contacts"
          element={
            <ProtectedRoute>
              <AdvisorContacts />
            </ProtectedRoute>
          }
            />
        <Route
          path="/advisors-consultation"
          element={
            <ProtectedRoute>
              <AdvisorsConsultation />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
