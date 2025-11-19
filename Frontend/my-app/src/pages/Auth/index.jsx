import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '../../components/GradientBackground';
import AuthCard from '../../components/AuthCard';
import AuthToggle from '../../components/AuthToggle';
import SignInForm from '../../components/SignInForm';
import SignUpForm from '../../components/SignUpForm';
import ExpertSignInForm from '../../components/ExpertSignInForm';
import Footer from '../../components/Footer';
import StyledAlert from '../../components/StyledAlert';

const GradientTitle = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 'bold',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  textShadow: '0 2px 15px rgba(156, 39, 176, 0.4)',
  animation: 'fadeInSlide 1.2s ease-out',
  '@keyframes fadeInSlide': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-30px) scale(0.9)',
    },
    '60%': {
      opacity: 0.8,
      transform: 'translateY(5px) scale(1.02)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
}));

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('signin');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const authOptions = [
    { value: 'signin', label: 'Sign In' },
    { value: 'signup', label: 'Sign Up' },
    { value: 'expert', label: 'Expert' }
  ];

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setAuthMode(newMode);
      setAlert({ type: '', message: '' }); // Clear alerts when switching
    }
  };

  const handleSuccess = (result, message) => {
    setAlert({ type: 'success', message });
    console.log(`${authMode} success:`, result);
    
    // Redirect based on user type
    if (authMode === 'expert') {
      console.log('Navigating to /expert-dashboard...');
      navigate('/expert-dashboard');
    } else {
      console.log('Navigating to /chatbot...');
      navigate('/chatbot');
    }
  };

  const handleError = (message) => {
    setAlert({ type: 'error', message });
  };

  const clearAlert = () => {
    setAlert({ type: '', message: '' });
  };

  return (
    <>
      <GradientBackground>
        <AuthCard>

          <AuthToggle
            value={authMode}
            onChange={handleModeChange}
            options={authOptions}
          />

          {alert.message && (
            <StyledAlert 
              severity={alert.type} 
              onClose={clearAlert}
            >
              {alert.message}
            </StyledAlert>
          )}

          {authMode === 'signin' ? (
            <SignInForm onSuccess={handleSuccess} onError={handleError} />
          ) : authMode === 'signup' ? (
            <SignUpForm onSuccess={handleSuccess} onError={handleError} />
          ) : (
            <ExpertSignInForm onSuccess={handleSuccess} onError={handleError} />
          )}

          <Typography
            variant="body2"
            sx={{
              marginTop: 3,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {authMode === 'signin' 
              ? "Don't have an account? Click Sign Up above. Experts use Expert Sign In."
              : authMode === 'signup'
              ? "Already have an account? Click User Sign In above. Experts use Expert Sign In."
              : "Username and Passkey are pre-determined by us for expert Sign In."
            }
          </Typography>
        </AuthCard>
      </GradientBackground>
      <Footer />
    </>
  );
};

export default AuthPage;