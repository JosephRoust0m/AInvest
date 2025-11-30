class AuthAPI {
  constructor() {
    this.baseURL = 'http://localhost:7000';
  }

  async signIn(credentials) {
    try {
      const response = await fetch(this.baseURL+`/api/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign in failed');
      }

      const result = await response.json();
      
      // Store the authentication token if provided
      if (result.token || result.accessToken || result.authToken) {
        const token = result.token || result.accessToken || result.authToken;
        localStorage.setItem('authToken', token);
        
        // Store user data (will be handled by calling component)
        result._token = token;
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(userData) {
    try {
      console.log(this.baseURL+"/api/sign-up")
      const response = await fetch(this.baseURL+`/api/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign up failed');
      }

      const result = await response.json();
      
      // Store the authentication token if provided
      if (result.token || result.accessToken || result.authToken) {
        const token = result.token || result.accessToken || result.authToken;
        localStorage.setItem('authToken', token);
      }

      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  validatePassword(password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    return true;
  }

  async sendLogoutTimestamp(username) {
    try {
      console.log('Sending logout timestamp for username:', username);
      const response = await fetch(this.baseURL+`/api/user/logout-timestamp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          username: username,
          logoutTimestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Logout timestamp recorded'
      };
    } catch (error) {
      console.error('Error sending logout timestamp:', error);
      return {
        success: false,
        error: 'Failed to record logout timestamp'
      };
    }
  }

}

export default new AuthAPI();