import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import GradientButton from '../GradientButton';
import StyledAlert from '../StyledAlert';
import AuthAPI from '../../api/AuthAPI';
import { expertLoginSuccess, setLastLogout } from '../../store/authSlice';

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.25),
  },
}));

const ExpertSignInForm = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    passkey: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Expert username is required';
    }

    if (!formData.passkey) {
      newErrors.passkey = 'Passkey is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await AuthAPI.expertSignIn(formData);
      console.log('Expert sign in API result:', result);
      
      // Store expert username in localStorage
      const username = result.expert?.username || result.username || formData.username;
      console.log('Extracted expert username:', username);
      localStorage.setItem('username', username);
      localStorage.setItem('userType', 'expert');
      
      // Store expert data in Redux
      const expertData = {
        username: username,
        token: result._token || result.token || result.accessToken
      };
      console.log('Dispatching expertLoginSuccess to Redux:', expertData);
      dispatch(expertLoginSuccess(expertData));
      
      // Fetch expert's last logout time from database
      console.log('Fetching expert last logout time after sign-in...');
      try {
        const lastLogoutResult = await AuthAPI.getExpertLastLogout(username);
        console.log('Expert last logout result:', lastLogoutResult);
        
        if (lastLogoutResult.success && lastLogoutResult.lastLogout) {
          console.log('Setting expert lastLogout from database:', lastLogoutResult.lastLogout);
          dispatch(setLastLogout(lastLogoutResult.lastLogout));
        } else {
          console.log('No expert lastLogout found, setting to current time');
          dispatch(setLastLogout(new Date().toISOString()));
        }
      } catch (error) {
        console.error('Error fetching expert last logout:', error);
        dispatch(setLastLogout(new Date().toISOString()));
      }
      
      console.log('Calling onSuccess callback');
      onSuccess?.(result, 'Expert sign in successful! Welcome back.');
      
      // Reset form
      setFormData({
        username: '',
        passkey: ''
      });
      
    } catch (error) {
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <StyledTextField
        fullWidth
        label="Expert Username"
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        required
        error={!!errors.username}
        helperText={errors.username}
        autoComplete="username"
      />

      <StyledTextField
        fullWidth
        label="Passkey"
        name="passkey"
        type="password"
        value={formData.passkey}
        onChange={handleInputChange}
        required
        error={!!errors.passkey}
        helperText={errors.passkey}
        autoComplete="current-password"
      />

      <GradientButton
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        loading={loading}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        Sign In as Expert
      </GradientButton>
    </Box>
  );
};

export default ExpertSignInForm;