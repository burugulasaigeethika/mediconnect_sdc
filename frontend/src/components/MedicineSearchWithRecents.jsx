import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import RecentSearches from './RecentSearches';
import './MedicineSearchWithRecents.css';

const MedicineSearchWithRecents = ({ onSearch, initialSearchTerm = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [showRecents, setShowRecents] = useState(false);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Handle clicks outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                searchInputRef.current !== event.target) {
                setShowRecents(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setShowRecents(e.target.value.length > 0);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setShowRecents(false);
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    const handleRecentItemClick = (item) => {
        // Check if this is a search term or a specific medicine
        if (item.itemId.startsWith('search:')) {
            // Extract the actual search term
            const actualSearchTerm = item.itemId.replace('search:', '');
            setSearchTerm(actualSearchTerm);
            if (onSearch) {
                onSearch(actualSearchTerm);
            }
        } else {
            // This is a specific medicine, use its name
            setSearchTerm(item.itemName);
            if (onSearch) {
                onSearch(item.itemName);
            }
        }
        setShowRecents(false);
    };

    const handleFocus = () => {
        if (searchTerm.length === 0) {
            setShowRecents(true);
        }
    };

    return (
        <div className="medicine-search-container" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleFocus}
                        className="form-input"
                    />
                    <button type="submit" className="search-button">
                        🔍
                    </button>
                </div>
            </form>
            
            {showRecents && (
                <div className="recent-searches-dropdown">
                    <RecentSearches 
                        type="medicine" 
                        onItemClick={handleRecentItemClick}
                        title="Recent Medicines"
                        showSearchTerms={true}
                    />
                </div>
            )}
        </div>
    );
};

export default MedicineSearchWithRecents;