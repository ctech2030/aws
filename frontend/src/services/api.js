import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Sends a message to the backend API and returns the AI response
 * @param {string} message - The user's message
 * @param {Array} history - Previous conversation history
 * @returns {Promise} The API response
 */
export const sendMessage = async (message, history = []) => {
  try {
    const response = await axios.post(`${API_URL}/api/chat`, {
      message,
      history
    }, {
      timeout: 120000 // 2 minute timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Checks if the backend API is available
 * @returns {Promise} The health check response
 */
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
