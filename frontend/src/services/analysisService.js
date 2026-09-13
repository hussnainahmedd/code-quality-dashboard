import api from './api';

export const analysisService = {
  getLatestAnalysis: async (repoId) => {
    const response = await api.get(`/analysis/${repoId}/latest`);
    return response.data;
  },
  getAnalysisHistory: async (repoId) => {
    const response = await api.get(`/analysis/${repoId}/history`);
    return response.data;
  },
  compareRepositories: async (repo1Id, repo2Id) => {
    const response = await api.get(`/analysis/compare?repo1_id=${repo1Id}&repo2_id=${repo2Id}`);
    return response.data;
  },
  getAnalysisDetail: async (analysisId) => {
    const response = await api.get(`/analysis/detail/${analysisId}`);
    return response.data;
  },
  generateReport: async (repoId) => {
    const response = await api.post(`/reports/${repoId}/generate`);
    return response.data;
  },
  downloadReport: async (repoId) => {
    const response = await api.get(`/reports/${repoId}/download`, { responseType: 'blob' });
    return response.data;
  }
};
