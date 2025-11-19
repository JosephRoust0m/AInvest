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

const SignUpForm = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Real-time password confirmation validation
    if (name === 'confirmPassword' && formData.password && value !== formData.password) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    } else if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else {
      try {
        AuthAPI.validatePassword(formData.password, formData.confirmPassword);
      } catch (error) {
        newErrors.confirmPassword = error.message;
      }
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
    
    console.log('SignUp Form Data:', {
      username: formData.username,
      email: formData.email,
      password: formData.password
    });
    
    try {
      const result = await AuthAPI.signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Store username in localStorage
      const username = result.user.username || formData.username;
      localStorage.setItem('username', username);
      
      // Store user data in Redux (excluding password)
      dispatch(loginSuccess({
        username: username,
        email: result.user.email || formData.email,
        token: result._token || result.token || result.accessToken
      }));

      
      onSuccess?.(result, 'Account created successfully! Welcome to Financial.');
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        value={formData.username}
        onChange={handleInputChange}
        required
        error={!!errors.username}
        helperText={errors.username}
        autoComplete="username"
      />

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
        autoComplete="new-password"
      />

      <StyledTextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        required
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        autoComplete="new-password"
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
        Create Account
      </GradientButton>
    </Box>
  );
};

export default SignUpForm;