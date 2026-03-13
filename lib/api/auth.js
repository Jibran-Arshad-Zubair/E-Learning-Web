import { apiClient } from './client';

export const authApi = {
  // Register user
  register: async (userData) => {
    
    const response = await apiClient.post('/register', userData);
    return response.data; 
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },

  // Google Login
  googleLogin: async (token) => {
    const response = await apiClient.post('/google-login', { token });
    return response.data;
  },

  // Facebook Login
  facebookLogin: async (token) => {
    const response = await apiClient.post('/facebook-login', { token });
    return response.data;
  },

  // Send OTP
  sendOTP: async (email) => {
    const response = await apiClient.post('/send-otp', { email });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data) => {
    const response = await apiClient.post('/forgot-password', data);
    return response.data;
  }
};