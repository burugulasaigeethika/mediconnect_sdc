import React from 'react';
import axios from 'axios';
import RecentSearches from './RecentSearches';
import './RecentOrders.css';

const RecentOrders = ({ onOrderSelect }) => {
    const handleOrderClick = (item) => {
        if (onOrderSelect) {
            onOrderSelect(item);
        }
    };

    return (
        <div className="recent-orders-widget">
            <div className="widget-header">
                <h3>🕒 Recent Orders</h3>
            </div>
            <div className="recent-orders-content">
                <RecentSearches 
                    type="order" 
                    onItemClick={handleOrderClick}
                    title="Recent Orders"
                />
            </div>
        </div>
    );
};

export default RecentOrders;