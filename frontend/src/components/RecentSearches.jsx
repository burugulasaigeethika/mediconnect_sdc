import React, { useState, useEffect } from 'react';
import { getRecentSearches, clearRecentSearches } from '../services/recentSearchService';
import './RecentSearches.css';

const RecentSearches = ({ type, onItemClick, title = 'Recent Searches', showSearchTerms = false }) => {
    const [recentItems, setRecentItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRecentSearches();
    }, [type]);

    const fetchRecentSearches = async () => {
        try {
            setLoading(true);
            const items = await getRecentSearches(type);
            
            // Filter out search terms if showSearchTerms is false
            const filteredItems = showSearchTerms 
                ? items 
                : items.filter(item => !item.itemId.startsWith('search:'));
            
            setRecentItems(filteredItems);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearRecent = async () => {
        try {
            await clearRecentSearches(type);
            setRecentItems([]);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleItemClick = (item) => {
        if (onItemClick) {
            onItemClick(item);
        }
    };

    if (loading) {
        return <div className="recent-searches-loading">Loading recent searches...</div>;
    }

    if (error) {
        return <div className="recent-searches-error">{error}</div>;
    }

    if (recentItems.length === 0) {
        return null;
    }

    return (
        <div className="recent-searches">
            <div className="recent-searches-header">
                <h4>
                    <span className="clock-icon">🕒</span>
                    {title}
                </h4>
                <button 
                    className="clear-button"
                    onClick={handleClearRecent}
                    aria-label="Clear recent searches"
                >
                    Clear All
                </button>
            </div>
            <ul className="recent-searches-list">
                {recentItems.map((item) => (
                    <li 
                        key={`${item.itemId}-${item.searchTime}`}
                        className="recent-search-item"
                        onClick={() => handleItemClick(item)}
                    >
                        {item.itemName}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentSearches;