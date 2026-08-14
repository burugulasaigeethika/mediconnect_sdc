import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Notifications.css';

const NotificationList = ({ isOpen, onClose }) => {
    const { user, ensureAuthHeaders } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            fetchNotifications();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            ensureAuthHeaders();
            const response = await axios.get('/api/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        // Prevent bubbling if triggered from a list item click
        if (e) e.stopPropagation();

        try {
            ensureAuthHeaders();
            await axios.patch(`/api/notifications/${id}/read`);
            // Update local state
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            ensureAuthHeaders();
            await axios.patch('/api/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();

        try {
            ensureAuthHeaders();
            await axios.delete(`/api/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <div className="notification-header">
                <h3>Notifications</h3>
                {notifications.some(n => !n.isRead) && (
                    <button className="mark-all-btn" onClick={handleMarkAllRead}>
                        Mark all read
                    </button>
                )}
            </div>

            <div className="notification-body">
                {loading ? (
                    <div className="loading-notifications">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={(e) => !notification.isRead && handleMarkAsRead(notification._id, e)}
                        >
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">
                                {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button
                                className="delete-notification-btn"
                                onClick={(e) => handleDelete(notification._id, e)}
                                title="Delete"
                            >
                                &times;
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationList;
