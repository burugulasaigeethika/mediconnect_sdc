import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './DoctorAccount.css';

const DoctorAccount = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        specialization: user?.specialization || '',
        experience: user?.experience || '',
        qualifications: user?.qualifications || '',
        consultationFee: user?.consultationFee || '',
        licenseNumber: user?.licenseNumber || ''
    });

    // Fetch complete doctor profile from database
    useEffect(() => {
        const fetchDoctorProfile = async () => {
            if (user?.userId) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/doctors/${user.userId}`);
                    const doctorData = response.data;

                    // Update profile data with fetched information
                    setProfileData({
                        name: doctorData.name || '',
                        email: doctorData.email || '',
                        phone: doctorData.phone || '',
                        specialization: doctorData.specialization || '',
                        experience: doctorData.experience || '',
                        qualifications: doctorData.qualifications || '',
                        consultationFee: doctorData.consultationFee || '',
                        licenseNumber: doctorData.licenseNumber || ''
                    });

                    // CRITICAL FIX: Update user context with complete data but PRESERVE the role field
                    if (updateUser) {
                        updateUser({
                            ...doctorData,
                            role: user.role // Preserve the original role to prevent redirect issues
                        });
                    }
                } catch (error) {
                    console.error('Error fetching doctor profile:', error);
                    setError('Failed to load profile data');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDoctorProfile();
    }, [user?.userId]);

    // Update form data when user context changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                specialization: user.specialization || '',
                experience: user.experience || '',
                qualifications: user.qualifications || '',
                consultationFee: user.consultationFee || '',
                licenseNumber: user.licenseNumber || ''
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
            const response = await axios.put(`/api/doctors/${user.userId}`, profileData);

            if (updateUser) {
                // CRITICAL: Also preserve role when saving
                const updatedData = response.data.doctor || response.data;
                updateUser({
                    ...updatedData,
                    role: user.role
                });
            }
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'D';
    };

    return (
        <div className="doctor-account-page">
            <div className="profile-container">
                {error && <div className="error-banner">{error}</div>}
                {success && <div className="success-banner">{success}</div>}

                <div className="profile-card">
                    <div className="profile-header">
                        <h1>Doctor Profile</h1>
                    </div>

                    <div className="profile-content">
                        <div className="profile-left">
                            {!isEditing ? (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{user?.name || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{user?.email || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">{user?.phone || 'Not added'}</span>
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
                                Dr. {user?.name || 'Doctor'}
                            </div>
                            <div className="profile-specialty">
                                {user?.specialization || 'Specialist'}
                            </div>
                        </div>

                        <div className="profile-right">
                            {!isEditing ? (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Doctor ID:</span>
                                        <span className="info-value">{user?.userId?.substring(0, 10) || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Specialization:</span>
                                        <span className="info-value">{user?.specialization || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Experience:</span>
                                        <span className="info-value">{user?.experience ? `${user.experience} years` : 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Qualifications:</span>
                                        <span className="info-value">{user?.qualifications || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Consultation Fee:</span>
                                        <span className="info-value">₹{user?.consultationFee || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">License Number:</span>
                                        <span className="info-value">{user?.licenseNumber || 'Not added'}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="edit-form-right">
                                    <div className="form-group-inline">
                                        <label>Specialization:</label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={profileData.specialization}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="e.g., Cardiologist"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>Experience:</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={profileData.experience}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="Years of experience"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>Qualifications:</label>
                                        <input
                                            type="text"
                                            name="qualifications"
                                            value={profileData.qualifications}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="e.g., MBBS, MD"
                                        />
                                    </div>
                                    <div className="form-group-inline">
                                        <label>Consultation Fee:</label>
                                        <input
                                            type="number"
                                            name="consultationFee"
                                            value={profileData.consultationFee}
                                            onChange={handleChange}
                                            className="inline-input"
                                            placeholder="Fee in ₹"
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
                                            placeholder="Medical license number"
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

export default DoctorAccount;
