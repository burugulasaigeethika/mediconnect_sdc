const RecentSearch = require('../models/RecentSearch');

class RecentSearchService {
    /**
     * Add or update a recent search entry
     * @param {String} userId - User ID
     * @param {String} type - Type of search (medicine, doctor, order)
     * @param {String} itemId - ID of the item
     * @param {String} itemName - Name of the item
     * @returns {Promise<Object>} - Recent search entry
     */
    static async addRecentSearch(userId, type, itemId, itemName) {
        try {
            // Try to find existing entry
            let recentSearch = await RecentSearch.findOne({ userId, type, itemId });
            
            if (recentSearch) {
                // Update existing entry timestamp
                recentSearch.searchTime = new Date();
                await recentSearch.save();
            } else {
                // Create new entry
                recentSearch = new RecentSearch({
                    userId,
                    type,
                    itemId,
                    itemName
                });
                await recentSearch.save();
                
                // Limit to 10 recent searches per user/type
                await this.limitRecentSearches(userId, type, 10);
            }
            
            return recentSearch;
        } catch (error) {
            throw new Error(`Error adding recent search: ${error.message}`);
        }
    }
    
    /**
     * Get recent searches for a user
     * @param {String} userId - User ID
     * @param {String} type - Type of search (medicine, doctor, order)
     * @param {Number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of recent searches
     */
    static async getRecentSearches(userId, type, limit = 10) {
        try {
            return await RecentSearch.find({ userId, type })
                .sort({ searchTime: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching recent searches: ${error.message}`);
        }
    }
    
    /**
     * Clear recent searches for a user
     * @param {String} userId - User ID
     * @param {String} type - Type of search (medicine, doctor, order)
     * @returns {Promise<Object>} - Deletion result
     */
    static async clearRecentSearches(userId, type) {
        try {
            return await RecentSearch.deleteMany({ userId, type });
        } catch (error) {
            throw new Error(`Error clearing recent searches: ${error.message}`);
        }
    }
    
    /**
     * Limit recent searches to a maximum count
     * @param {String} userId - User ID
     * @param {String} type - Type of search
     * @param {Number} limit - Maximum number of entries
     * @returns {Promise<void>}
     */
    static async limitRecentSearches(userId, type, limit) {
        try {
            // Find all entries for this user and type, sorted by time
            const entries = await RecentSearch.find({ userId, type })
                .sort({ searchTime: -1 })
                .select('_id');
            
            // If we have more than the limit, delete the excess
            if (entries.length > limit) {
                const idsToDelete = entries.slice(limit).map(entry => entry._id);
                await RecentSearch.deleteMany({ _id: { $in: idsToDelete } });
            }
        } catch (error) {
            throw new Error(`Error limiting recent searches: ${error.message}`);
        }
    }
}

module.exports = RecentSearchService;