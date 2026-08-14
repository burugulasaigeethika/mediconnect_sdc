import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Added axios
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import NotificationList from './NotificationList'; // Added NotificationList
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout, ensureAuthHeaders } = useAuth(); // Added ensureAuthHeaders
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count periodically
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            ensureAuthHeaders();
            const response = await axios.get('/api/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Determine user role
    const getUserRole = () => {
        if (location.pathname.includes('/dashboard/doctor')) {
            return 'doctor';
        }
        if (location.pathname.includes('/dashboard/pharmacist')) {
            return 'pharmacist';
        }
        if (location.pathname.includes('/dashboard/admin')) {
            return 'admin';
        }
        return 'patient';
    };

    // Toggle Notifications
    const toggleNotifications = () => {
        if (!showNotifications) fetchUnreadCount(); // Refresh on open
        setShowNotifications(!showNotifications);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🏥</span>
                    <span className="brand-text">MediConnect</span>
                </Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <>
                        {getUserRole() !== 'admin' ? (
                            <>
                                {/* Show Home link for non-doctor users */}
                                {getUserRole() !== 'doctor' && <Link to="/" className="nav-link">Home</Link>}
                                {(getUserRole() !== 'doctor' && getUserRole() !== 'pharmacist') && <Link to="/doctors" className="nav-link">Find Doctors</Link>}
                                {(getUserRole() !== 'doctor' && getUserRole() !== 'pharmacist') && <Link to="/pharmacy" className="nav-link">Pharmacy</Link>}
                                {(getUserRole() !== 'doctor' && getUserRole() !== 'pharmacist') && <Link to="/about" className="nav-link">About</Link>}
                                {(getUserRole() !== 'doctor' && getUserRole() !== 'pharmacist') && <Link to="/contact" className="nav-link">Contact Us</Link>}
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                        {(getUserRole() !== 'doctor' && getUserRole() !== 'pharmacist') && <Link to="/appointments" className="nav-link">My Appointments</Link>}

                                        {/* Cart Icon */}
                                        {(getUserRole() !== 'doctor' && getUserRole() !== 'pharmacist') && (
                                            <Link to="/cart" className="cart-icon-link" title="Shopping Cart">
                                                <div className="cart-icon-wrapper">
                                                    🛒
                                                    <span className="cart-badge">0</span>
                                                </div>
                                            </Link>
                                        )}

                                        {/* Notification Bell */}
                                        <div className="notification-wrapper">
                                            <button
                                                className="notification-icon-btn"
                                                onClick={toggleNotifications}
                                                title="Notifications"
                                            >
                                                🔔
                                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                            </button>
                                            <NotificationList
                                                isOpen={showNotifications}
                                                onClose={() => setShowNotifications(false)}
                                            />
                                        </div>

                                        <ProfileDropdown
                                            user={user}
                                            role={getUserRole()}
                                            onLogout={handleLogout}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="btn btn-secondary">Login</Link>
                                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {isAuthenticated && (
                                    <>
                                        <Link to="/dashboard/admin" className="nav-link">Dashboard</Link>
                                        
                                        {/* Notification Bell */}
                                        <div className="notification-wrapper">
                                            <button
                                                className="notification-icon-btn"
                                                onClick={toggleNotifications}
                                                title="Notifications"
                                            >
                                                🔔
                                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                            </button>
                                            <NotificationList
                                                isOpen={showNotifications}
                                                onClose={() => setShowNotifications(false)}
                                            />
                                        </div>
                                        
                                        <ProfileDropdown
                                            user={user}
                                            role={getUserRole()}
                                            onLogout={handleLogout}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;