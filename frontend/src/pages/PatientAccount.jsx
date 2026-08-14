import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PatientAccount.css';

const PatientAccount = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        // Health Fields
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        insuranceProvider: user?.insuranceProvider || '',
        allergies: user?.allergies ? user.allergies.join(', ') : '',
        currentMedications: user?.currentMedications ? user.currentMedications.join(', ') : '',
        // Emergency Contact
        contactPerson: user?.emergencyContact?.name || '',
        contactPhone: user?.emergencyContact?.phone || ''
    });

    const [addressData, setAddressData] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || ''
    });

    // Update form data when user context changes
    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                insuranceProvider: user.insuranceProvider || '',
                allergies: user.allergies ? user.allergies.join(', ') : '',
                currentMedications: user.currentMedications ? user.currentMedications.join(', ') : '',
                contactPerson: user.emergencyContact?.name || '',
                contactPhone: user.emergencyContact?.phone || ''
            });
            setAddressData({
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zipCode: user.address?.zipCode || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddressChange = (e) => {
        setAddressData({
            ...addressData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Prepare payload
            const profilePayload = {
                ...profileData,
                // Check if allergies/medications are strings and split them
                allergies: typeof profileData.allergies === 'string'
                    ? profileData.allergies.split(',').map(item => item.trim()).filter(Boolean)
                    : profileData.allergies,
                currentMedications: typeof profileData.currentMedications === 'string'
                    ? profileData.currentMedications.split(',').map(item => item.trim()).filter(Boolean)
                    : profileData.currentMedications
            };

            // Update profile (includes health data)
            const profileResponse = await axios.put('/api/users/profile', profilePayload);

            // Update address
            const addressResponse = await axios.put('/api/users/address', { address: addressData });

            if (updateUser) {
                // Merge users from both responses (they should be identical mostly)
                updateUser(addressResponse.data.user);
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
        return 'U';
    };

    const formatAddress = () => {
        if (!user?.address?.street) return 'No address added';
        const { street, city, state, zipCode } = user.address;
        return `${street}, ${city}, ${state} ${zipCode}`;
    };

    return (
        <div className="patient-account-page">
            <div className="profile-container">
                {error && <div className="error-banner">{error}</div>}
                {success && <div className="success-banner">{success}</div>}

                <div className="profile-card">
                    <div className="profile-header">
                        <h1>Patient Profile</h1>
                        {!isEditing ? (
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div className="action-buttons">
                                <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className="btn-save" onClick={handleSave} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-sections">
                        {/* Section 1: Personal Information */}
                        <section className="profile-section">
                            <h3>👤 Personal Information</h3>
                            <div className="grid-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="form-input" />
                                    ) : (
                                        <div className="display-value">{user?.name || '-'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="display-value">{user?.email || '-'}</div>
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    {isEditing ? (
                                        <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className="form-input" />
                                    ) : (
                                        <div className="display-value">{user?.phone || '-'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    {isEditing ? (
                                        <input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} className="form-input" />
                                    ) : (
                                        <div className="display-value">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    {isEditing ? (
                                        <select name="gender" value={profileData.gender} onChange={handleProfileChange} className="form-select">
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    ) : (
                                        <div className="display-value capitalize">{user?.gender || '-'}</div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <hr />

                        {/* Section 2: Address */}
                        <section className="profile-section">
                            <h3>📍 Address</h3>
                            {isEditing ? (
                                <div className="grid-form">
                                    <div className="form-group">
                                        <label>Street</label>
                                        <input type="text" name="street" value={addressData.street} onChange={handleAddressChange} className="form-input" placeholder="123 Main St" />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" name="city" value={addressData.city} onChange={handleAddressChange} className="form-input" placeholder="City" />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input type="text" name="state" value={addressData.state} onChange={handleAddressChange} className="form-input" placeholder="State" />
                                    </div>
                                    <div className="form-group">
                                        <label>ZIP Code</label>
                                        <input type="text" name="zipCode" value={addressData.zipCode} onChange={handleAddressChange} className="form-input" placeholder="12345" />
                                    </div>
                                </div>
                            ) : (
                                <div className="display-value full-width">{formatAddress()}</div>
                            )}
                        </section>

                        <hr />

                        {/* Section 3: Health Profile */}
                        <section className="profile-section">
                            <h3>🏥 Health Profile</h3>
                            <div className="grid-form">
                                <div className="form-group">
                                    <label>Insurance Provider</label>
                                    {isEditing ? (
                                        <input type="text" name="insuranceProvider" value={profileData.insuranceProvider} onChange={handleProfileChange} className="form-input" placeholder="e.g. Blue Cross" />
                                    ) : (
                                        <div className="display-value">{user?.insuranceProvider || 'Not specified'}</div>
                                    )}
                                </div>
                                <div className="form-group full-width">
                                    <label>Allergies (comma separated)</label>
                                    {isEditing ? (
                                        <textarea name="allergies" value={profileData.allergies} onChange={handleProfileChange} className="form-textarea" placeholder="Peanuts, Penicillin..." />
                                    ) : (
                                        <div className="display-value">
                                            {user?.allergies && user.allergies.length > 0 ? (
                                                <div className="tags">
                                                    {user.allergies.map((a, i) => <span key={i} className="tag tag-red">{a}</span>)}
                                                </div>
                                            ) : 'None listed'}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group full-width">
                                    <label>Current Medications (comma separated)</label>
                                    {isEditing ? (
                                        <textarea name="currentMedications" value={profileData.currentMedications} onChange={handleProfileChange} className="form-textarea" placeholder="Aspirin 100mg, ..." />
                                    ) : (
                                        <div className="display-value">
                                            {user?.currentMedications && user.currentMedications.length > 0 ? (
                                                <div className="tags">
                                                    {user.currentMedications.map((m, i) => <span key={i} className="tag tag-blue">{m}</span>)}
                                                </div>
                                            ) : 'None listed'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <hr />

                        {/* Section 4: Emergency Contact */}
                        <section className="profile-section">
                            <h3>🆘 Emergency Contact</h3>
                            <div className="grid-form">
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    {isEditing ? (
                                        <input type="text" name="contactPerson" value={profileData.contactPerson} onChange={handleProfileChange} className="form-input" />
                                    ) : (
                                        <div className="display-value">{user?.emergencyContact?.name || '-'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    {isEditing ? (
                                        <input type="tel" name="contactPhone" value={profileData.contactPhone} onChange={handleProfileChange} className="form-input" />
                                    ) : (
                                        <div className="display-value">{user?.emergencyContact?.phone || '-'}</div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAccount;
