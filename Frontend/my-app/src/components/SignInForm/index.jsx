import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import GradientButton from '../GradientButton';
import StyledAlert from '../StyledAlert';
import AuthAPI from '../../api/AuthAPI';
import { loginSuccess } from '../../store/authSlice';


const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.25),
  },
}));

const SignInForm = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      try {
        AuthAPI.validateEmail(formData.email);
      } catch (error) {
        newErrors.email = error.message;
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const result = await AuthAPI.signIn(formData);
      console.log('Sign in API result:', result);
      
      // Store username in localStorage - handle different response structures
      const username = result.user?.username || result.username || result.name || 'User';
      console.log('Extracted username:', username);
      localStorage.setItem('username', username);
      
      // Store user data in Redux (excluding password)
      const userData = {
        username: username,
        email: result.user?.email || result.email || formData.email,
        token: result._token || result.token || result.accessToken
      };
      console.log('Dispatching to Redux:', userData);
      dispatch(loginSuccess(userData));
      
      console.log('Calling onSuccess callback');
      onSuccess?.(result, 'Sign in successful! Welcome back.');
      
      // Reset form
      setFormData({
        email: '',
        password: ''
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
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
        error={!!errors.email}
        helperText={errors.email}
        autoComplete="email"
      />

      <StyledTextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        required
        error={!!errors.password}
        helperText={errors.password}
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
        Sign In
      </GradientButton>
    </Box>
  );
};

export default SignInForm;