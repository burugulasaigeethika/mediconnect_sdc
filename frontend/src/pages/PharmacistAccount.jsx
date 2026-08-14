import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PharmacistAccount.css';

const PharmacistAccount = () => {
    const { user, updateUser, ensureAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Add a state to track if component has mounted
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        pharmacyName: user?.pharmacyName || '',
        licenseNumber: user?.licenseNumber || '',
        address: user?.address || ''
    });

    // Fetch complete pharmacist profile from database
    useEffect(() => {
        const fetchPharmacistProfile = async () => {
            // Early return if no user or no user ID
            if (!user || !user.id) {
                console.log('No user or user ID found');
                return;
            }

            try {
                setLoading(true);
                setError('');

                // Ensure auth headers are set before making API call
                ensureAuthHeaders();
                console.log('Fetching pharmacist profile for ID:', user.id);
                const response = await axios.get(`/api/pharmacists/profile/${user.id}`);
                const pharmacistData = response.data;
                console.log('Received pharmacist data:', pharmacistData);

                // Update profile data with fetched information
                setProfileData({
                    name: pharmacistData.name || '',
                    email: pharmacistData.email || '',
                    phone: pharmacistData.phone || '',
                    pharmacyName: pharmacistData.pharmacyName || '',
                    licenseNumber: pharmacistData.licenseNumber || '',
                    address: pharmacistData.address || ''
                });

                // Update user context with complete data but PRESERVE the role field
                if (updateUser) {
                    updateUser({
                        ...pharmacistData,
                        role: user.role // Preserve the original role to prevent redirect issues
                    });
                }
            } catch (error) {
                console.error('Error fetching pharmacist profile:', error);
                console.error('Error response:', error.response);
                setError('Failed to load profile data: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacistProfile();
    }, [user?.id, updateUser, ensureAuthHeaders]);

    // Update form data when user context changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                pharmacyName: user.pharmacyName || '',
                licenseNumber: user.licenseNumber || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            const response = await axios.put(`/api/pharmacists/profile/${user.id}`, profileData);

            if (updateUser) {
                // CRITICAL: Also preserve role when saving
                const updatedData = response.data.pharmacist || response.data;
                updateUser({
                    ...updatedData,
                    role: user.role
                });
            }
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating pharmacist profile:', err);
            console.error('Error response:', err.response);
            setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'P';
    };

    // Show loading state while component is mounting or user is loading
    if (!hasMounted) {
        return (
            <div className="pharmacist-account-page">
                <div className="profile-container">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    // Show error if no user
    if (!user) {
        return (
            <div className="pharmacist-account-page">
                <div className="profile-container">
                    <div className="error-banner">User not found. Please log in again.</div>
                </div>
            </div>
        );
    }

    // Helper to safely render values that might be objects
    const renderValue = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    };

    return (
        <div className="pharmacist-account-page">
            <div className="profile-container">
                {error && <div className="error-banner">{error}</div>}
                {success && <div className="success-banner">{success}</div>}

                <div className="profile-card">
                    <div className="profile-header">
                        <h1>Pharmacist Profile</h1>
                    </div>

                    <div className="profile-content">
                        <div className="profile-left">
                            {!isEditing ? (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{renderValue(user?.name) || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{renderValue(user?.email) || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">{renderValue(user?.phone) || 'Not added'}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="edit-form-left">
                                    <div className="form-group-inline">
                                        <label>Name:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleChange}
                                            className="inline-input"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            disabled
                                            className="inline-input disabled"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>Phone:</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-center">
                            <div className="profile-avatar-large">
                                {getUserInitial()}
                            </div>
                            <div className="profile-name-display">
                                {renderValue(user?.name) || 'Pharmacist'}
                            </div>
                            <div className="profile-specialty">
                                {renderValue(user?.pharmacyName) || 'Pharmacy'}
                            </div>
                        </div>

                        <div className="profile-right">
                            {!isEditing ? (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Pharmacist ID:</span>
                                        <span className="info-value">{user?.id ? (typeof user.id === 'object' ? JSON.stringify(user.id) : user.id.substring(0, 10)) : 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Pharmacy Name:</span>
                                        <span className="info-value">{renderValue(user?.pharmacyName) || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">License Number:</span>
                                        <span className="info-value">{renderValue(user?.licenseNumber) || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Address:</span>
                                        <span className="info-value">{renderValue(user?.address) || 'Not set'}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="edit-form-right">
                                    <div className="form-group-inline">
                                        <label>Pharmacy Name:</label>
                                        <input
                                            type="text"
                                            name="pharmacyName"
                                            value={profileData.pharmacyName}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="e.g., Apollo Pharmacy"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>License Number:</label>
                                        <input
                                            type="text"
                                            name="licenseNumber"
                                            value={profileData.licenseNumber}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="Pharmacy license number"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>Address:</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={profileData.address}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="Pharmacy address"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions">
                        {!isEditing ? (
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn-save"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError('');
                                        setSuccess('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacistAccount;
