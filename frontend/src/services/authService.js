import api from './api';

export const authService = {
  getGithubAuthUrl: async () => {
    const response = await api.get('/auth/github/url');
    return response.data;
  },
  loginWithCode: async (code) => {
    const response = await api.post('/auth/github/callback', { code });
    return response.data;
  },
  demoLogin: async () => {
    const response = await api.post('/auth/demo-login');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
