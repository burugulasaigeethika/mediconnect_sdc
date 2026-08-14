import axios from 'axios';
import API_CONFIG from '../config/api';

/**
 * Medicine Service for Frontend
 * Provides functions to fetch medicine data from local database
 */

/**
 * Fetch medicines from the backend API (Local database)
 * @param {Object} options - Fetch options
 * @param {number} options.limit - Number of records to fetch
 * @returns {Promise<Array>} Array of medicine objects
 */
export const fetchMedicines = async (options = {}) => {
    try {
        const { limit = 100 } = options;

        // Fetch from local database via backend
        const response = await axios.get('/api/medicines', {
            params: { limit }
        });

        // Return array directly (local database format)
        return response.data;
    } catch (error) {
        console.error('Error fetching medicines:', error);
        throw new Error('Failed to fetch medicines');
    }
};

/**
 * Search medicines by name (Local database)
 * @param {string} searchTerm - Term to search for
 * @returns {Promise<Array>} Array of matching medicine objects
 */
export const searchMedicines = async (searchTerm) => {
    try {
        if (!searchTerm) {
            throw new Error('Search term is required');
        }

        // Search in local database via backend
        const response = await axios.get('/api/medicines/search', {
            params: { q: searchTerm }
        });

        // Return array directly (local database format)
        return response.data;
    } catch (error) {
        console.error('Error searching medicines:', error);
        throw new Error('Failed to search medicines');
    }
};

/**
 * Get medicines by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Array of medicine objects
 */
export const fetchMedicinesByCategory = async (category) => {
    try {
        const response = await axios.get(`/api/medicines/category/${category}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching medicines by category:', error);
        throw new Error('Failed to fetch medicines by category');
    }
};

/**
 * Get medicine by ID
 * @param {string} medicineId - Medicine identifier
 * @returns {Promise<Object>} Medicine object
 */
export const getMedicineById = async (medicineId) => {
    try {
        const response = await axios.get(`/api/medicines/${medicineId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching medicine by ID:', error);
        throw new Error('Failed to fetch medicine details');
    }
};

export default {
    fetchMedicines,
    searchMedicines,
    fetchMedicinesByCategory,
    getMedicineById
};