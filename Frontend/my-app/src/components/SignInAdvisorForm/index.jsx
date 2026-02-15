import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import GradientButton from '../GradientButton';
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
    username: '',
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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
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
      const result = await AuthAPI.signInAdvisor(formData);
      
      const username = result.advisor?.username;
      localStorage.setItem('username', username);
      
      // Store user data in Redux (excluding password)
      const userData = {
        username: username,
        token: result._token || result.token || result.accessToken
      };
      dispatch(loginSuccess(userData));
      
      onSuccess?.(result, 'Sign in successful! Welcome back.');
      
      // Reset form
      setFormData({
        username: '',
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
        label="Username"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleInputChange}
        required
        error={!!errors.username}
        helperText={errors.username}
        autoComplete="username"
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
        Advisor Sign In
      </GradientButton>
    </Box>
  );
};

export default SignInForm;