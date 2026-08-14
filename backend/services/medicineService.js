const axios = require('axios');

/**
 * Medicine Service for OGD (Open Government Data) API Integration
 * Fetches medicine-related data from data.gov.in
 */

// Resource ID for medicine data from data.gov.in
// Common resource IDs for medicine/healthcare data (replace with the correct one for your needs):
// - Medicine price data: 'medicines-price-data-resource-id'
// - Generic medicine data: 'generic-medicines-resource-id'
// - Medicine availability: 'medicine-availability-resource-id'
const MEDICINE_RESOURCE_ID = process.env.OGD_MEDICINE_RESOURCE_ID || 'medicines-price-data-resource-id';

/**
 * Fetch medicine data from OGD API
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Medicine data from OGD API
 */
const fetchOGDMedicines = async (params = {}) => {
    try {
        const apiKey = process.env.OGD_API_KEY;
        
        if (!apiKey) {
            throw new Error('OGD API key is not configured');
        }

        // Construct the API URL with the provided resource ID and API key
        const apiUrl = `https://api.data.gov.in/resource/${MEDICINE_RESOURCE_ID}`;
        
        // Prepare query parameters
        const queryParams = {
            'api-key': apiKey,
            format: 'json',
            limit: params.limit || 100,
            offset: params.offset || 0
        };
        
        // Add filters if provided
        if (params.filters) {
            Object.keys(params.filters).forEach(key => {
                queryParams[`filters[${key}]`] = params.filters[key];
            });
        }

        // Make the API request
        const response = await axios.get(apiUrl, { params: queryParams });
        
        // Return the data from the response
        return response.data;
    } catch (error) {
        console.error('Error fetching medicine data from OGD API:', error.message);
        
        // Re-throw the error for proper handling upstream
        throw new Error(`Failed to fetch medicine data: ${error.message}`);
    }
};

/**
 * Search medicines in OGD API by name or other criteria
 * @param {string} searchTerm - Term to search for
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
const searchOGDMedicines = async (searchTerm, filters = {}) => {
    try {
        // Add search term to filters
        const searchParams = {
            ...filters,
            limit: filters.limit || 100
        };
        
        // Add search term as a filter
        if (searchTerm) {
            searchParams.filters = {
                ...searchParams.filters,
                name: searchTerm
            };
        }
        
        return await fetchOGDMedicines(searchParams);
    } catch (error) {
        console.error('Error searching medicines in OGD API:', error.message);
        throw new Error(`Failed to search medicines: ${error.message}`);
    }
};

/**
 * Get medicine details by ID from OGD API
 * @param {string} medicineId - Medicine identifier
 * @returns {Promise<Object>} Medicine details
 */
const getOGDMedicineById = async (medicineId) => {
    try {
        // For getting a specific record, we might need to use filters
        const filters = {
            'filters[id]': medicineId
        };
        
        const result = await fetchOGDMedicines(filters);
        
        // Return the first record if found
        if (result.records && result.records.length > 0) {
            return result.records[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching medicine by ID from OGD API:', error.message);
        throw new Error(`Failed to fetch medicine details: ${error.message}`);
    }
};

module.exports = {
    fetchOGDMedicines,
    searchOGDMedicines,
    getOGDMedicineById
};