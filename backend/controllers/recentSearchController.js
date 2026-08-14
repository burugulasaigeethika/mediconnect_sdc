const RecentSearchService = require('../services/recentSearchService');

/**
 * Get recent searches for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecentSearches = async (req, res) => {
    try {
        const { type } = req.query;
        const userId = req.user.userId;
        
        if (!type) {
            return res.status(400).json({ message: 'Type parameter is required' });
        }
        
        const recentSearches = await RecentSearchService.getRecentSearches(userId, type);
        
        res.json({
            success: true,
            data: recentSearches
        });
    } catch (error) {
        console.error('Error fetching recent searches:', error);
        res.status(500).json({ message: 'Error fetching recent searches', error: error.message });
    }
};

/**
 * Clear recent searches for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearRecentSearches = async (req, res) => {
    try {
        const { type } = req.query;
        const userId = req.user.userId;
        
        if (!type) {
            return res.status(400).json({ message: 'Type parameter is required' });
        }
        
        await RecentSearchService.clearRecentSearches(userId, type);
        
        res.json({
            success: true,
            message: 'Recent searches cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing recent searches:', error);
        res.status(500).json({ message: 'Error clearing recent searches', error: error.message });
    }
};