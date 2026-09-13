import api from './api';

export const repoService = {
  searchRepos: async (query) => {
    const response = await api.get(`/repos/search?q=${query}`);
    return response.data;
  },
  getMyRepos: async () => {
    const response = await api.get('/repos/mine');
    return response.data;
  },
  addRepository: async (fullName) => {
    const response = await api.post('/repos/', { full_name: fullName });
    return response.data;
  },
  getRepositories: async () => {
    const response = await api.get('/repos/');
    return response.data;
  },
  getRepository: async (id) => {
    const response = await api.get(`/repos/${id}`);
    return response.data;
  },
  deleteRepository: async (id) => {
    const response = await api.delete(`/repos/${id}`);
    return response.data;
  },
  analyzeRepository: async (id) => {
    const response = await api.post(`/repos/${id}/analyze`);
    return response.data;
  }
};
