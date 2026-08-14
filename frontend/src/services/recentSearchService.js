import axios from 'axios';

const API_BASE_URL = '/api/recent-searches';

/**
 * Get recent searches for a user
 * @param {String} type - Type of search (medicine, doctor, order)
 * @returns {Promise<Array>} - Array of recent searches
 */
export const getRecentSearches = async (type) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/?type=${type}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching recent ${type} searches:`, error);
        throw new Error(`Failed to fetch recent ${type} searches`);
    }
};

/**
 * Clear recent searches for a user
 * @param {String} type - Type of search (medicine, doctor, order)
 * @returns {Promise<Object>} - Response object
 */
export const clearRecentSearches = async (type) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/clear?type=${type}`);
        return response.data;
    } catch (error) {
        console.error(`Error clearing recent ${type} searches:`, error);
        throw new Error(`Failed to clear recent ${type} searches`);
    }
};

export default {
    getRecentSearches,
    clearRecentSearches
};