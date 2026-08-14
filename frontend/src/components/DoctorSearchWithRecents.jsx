import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecentSearches from './RecentSearches';
import './DoctorSearchWithRecents.css';

const DoctorSearchWithRecents = ({ onSearch, initialSearchTerm = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [showRecents, setShowRecents] = useState(false);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceTimerRef = useRef(null);

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
        const value = e.target.value;
        setSearchTerm(value);
        setShowRecents(value.length > 0);
    };

    const handleSearchSubmit = useCallback(async (e) => {
        e.preventDefault();
        setShowRecents(false);
        if (onSearch && searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
    }, [searchTerm, onSearch]);

    const handleRecentItemClick = (item) => {
        // Check if this is a search term or a specific doctor
        if (item.itemId.startsWith('search:')) {
            // Extract the actual search term
            const actualSearchTerm = item.itemId.replace('search:', '');
            setSearchTerm(actualSearchTerm);
            if (onSearch) {
                onSearch(actualSearchTerm);
            }
        } else {
            // This is a specific doctor, use its name
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
        <div className="doctor-search-container" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search doctors, specializations, or symptoms..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleFocus}
                        className="form-input"
                        aria-label="Search doctors"
                        autoComplete="off"
                    />
                    <button type="submit" className="search-button" aria-label="Search">
                        Search
                    </button>
                </div>
            </form>

            {showRecents && (
                <div className="recent-searches-dropdown">
                    <RecentSearches
                        type="doctor"
                        onItemClick={handleRecentItemClick}
                        title="Recent Doctors"
                        showSearchTerms={true}
                    />
                </div>
            )}
        </div>
    );
};

export default DoctorSearchWithRecents;