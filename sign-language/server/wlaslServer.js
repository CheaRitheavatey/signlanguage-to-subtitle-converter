// src/services/wlaslService.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sign-language-api-439873574008.us-central1.run.app'  // Replace with your URL
  : 'http://localhost:8080/api';

export const wlaslService = {
  // Get all words from dataset
  getWords: async () => {
    const response = await fetch(`${API_BASE_URL}/words`);
    return response.json();
  },

  // Get sample videos
  getSampleVideos: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/sample-videos?limit=${limit}`);
    return response.json();
  },

  // Search videos
  searchVideos: async (query = '', limit = 20) => {
    const response = await fetch(`${API_BASE_URL}/videos/search?query=${query}&limit=${limit}`);
    return response.json();
  },

  // Analyze uploaded video
  analyzeSign: async (videoFile) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    
    const response = await fetch(`${API_BASE_URL}/analyze-sign`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // Get dataset info
  getDatasetInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/dataset-info`);
    return response.json();
  }
};