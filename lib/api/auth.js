import { apiClient } from './client';

export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  signup: async (userData) => {
    return apiClient.post('/auth/signup', userData);
  },

//   logout: async () => {
//     return apiClient.post('/auth/logout');
//   },

//   forgotPassword: async (email) => {
//     return apiClient.post('/auth/forgot-password', { email });
//   },

//   resetPassword: async (token, newPassword) => {
//     return apiClient.post(`/auth/reset-password/${token}`, { password: newPassword });
//   },

//   verifyEmail: async (token) => {
//     return apiClient.get(`/auth/verify-email/${token}`);
//   }
};