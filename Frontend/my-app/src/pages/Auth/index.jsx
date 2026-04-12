import React, { useEffect, useState } from 'react';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Box, Backdrop, CircularProgress, Typography } from '@mui/material';
import GradientBackground from '../../components/GradientBackground';
import Footer from '../../components/Footer';

const clerkAppearance = {
  variables: {
    colorPrimary: '#9c27b0',
    colorBackground: '#1a1a1a',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255, 255, 255, 0.6)',
    colorInputBackground: 'rgba(255, 255, 255, 0.07)',
    colorInputText: '#ffffff',
    colorNeutral: '#ffffff',
    colorDanger: '#f44336',
    borderRadius: '12px',
    fontFamily: 'inherit',
  },
  elements: {
    // Outer card
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
    },
    // Header
    headerTitle: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
    // Form fields
    formFieldLabel: {
      color: 'rgba(255, 255, 255, 0.85)',
    },
    formFieldInput: {
      background: 'rgba(255, 255, 255, 0.07)',
      border: '1px solid rgba(156, 39, 176, 0.3)',
      color: '#ffffff',
      '&:focus': {
        border: '1px solid rgba(156, 39, 176, 0.8)',
        boxShadow: '0 0 0 2px rgba(156, 39, 176, 0.15)',
      },
    },
    formFieldInputShowPasswordButton: {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    // Primary action button
    formButtonPrimary: {
      background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)',
      color: '#ffffff',
      fontWeight: 'bold',
      '&:hover': {
        background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
      },
    },
    // Social / OAuth buttons
    socialButtonsBlockButton: {
      background: 'rgba(255, 255, 255, 0.07)',
      border: '1px solid rgba(156, 39, 176, 0.25)',
      color: '#ffffff',
      '&:hover': {
        background: 'rgba(156, 39, 176, 0.15)',
      },
    },
    socialButtonsBlockButtonText: {
      color: '#ffffff',
    },
    // Divider
    dividerLine: {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    dividerText: {
      color: 'rgba(255, 255, 255, 0.4)',
    },
    // Footer links ("Don't have an account? Sign up")
    footerActionLink: {
      color: '#ce93d8',
      '&:hover': { color: '#f3e5f5' },
    },
    footerActionText: {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    // Identity preview (shown after email step)
    identityPreviewText: { color: '#ffffff' },
    identityPreviewEditButton: { color: '#ce93d8' },
    // Error / alert messages
    alertText: { color: '#ffffff' },
    formFieldErrorText: { color: '#ef9a9a' },
  },
};

const AuthPage = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      navigate('/chatbot');
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <GradientBackground>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
          <SignIn
            routing="hash"
            forceRedirectUrl="/chatbot"
            appearance={clerkAppearance}
            onSignIn={() => setSigningIn(true)}
          />
        </Box>
      </GradientBackground>
      <Footer />
      <Backdrop open={signingIn} sx={{ zIndex: 9999, flexDirection: 'column', gap: 2, bgcolor: 'rgba(0,0,0,0.75)' }}>
        <CircularProgress sx={{ color: '#9c27b0' }} size={52} />
        <Typography sx={{ color: '#fff', letterSpacing: 1 }}>Signing in...</Typography>
      </Backdrop>
    </>
  );
};

export default AuthPage;
