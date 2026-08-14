import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MyAddresses.css';

const MyAddresses = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [addressData, setAddressData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const handleAddressChange = (e) => {
        setAddressData({
            ...addressData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = () => {
        if (user?.address) {
            setAddressData({
                street: user.address.street || '',
                city: user.address.city || '',
                state: user.address.state || '',
                zipCode: user.address.zipCode || ''
            });
        }
        setIsEditing(true);
        setIsAdding(false);
    };

    const handleAddNew = () => {
        setAddressData({
            street: '',
            city: '',
            state: '',
            zipCode: ''
        });
        setIsAdding(true);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put('/api/users/address', { address: addressData });
            if (updateUser) {
                updateUser(response.data.user);
            }
            setSuccess('Address saved successfully!');
            setIsEditing(false);
            setIsAdding(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put('/api/users/address', {
                address: { street: '', city: '', state: '', zipCode: '' }
            });
            if (updateUser) {
                updateUser(response.data.user);
            }
            setSuccess('Address deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete address');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsAdding(false);
        setError('');
    };

    const hasAddress = user?.address?.street && user?.address?.city;

    return (
        <div className="my-addresses-page">
            <div className="addresses-container">
                <div className="addresses-header">
                    <h1>Addresses</h1>
                </div>

                <p className="addresses-subtitle">View, add, change or delete an address.</p>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="addresses-table">
                    <div className="table-header">
                        <div className="col-type">Address Type</div>
                        <div className="col-address">Address</div>
                        <div className="col-actions">Actions</div>
                    </div>

                    {!isEditing && !isAdding && hasAddress && (
                        <div className="table-row">
                            <div className="col-type">
                                <strong>Home</strong>
                            </div>
                            <div className="col-address">
                                {user.address.street}<br />
                                {user.address.city}, {user.address.state} {user.address.zipCode}
                            </div>
                            <div className="col-actions">
                                <button className="btn-edit" onClick={handleEdit}>edit</button>
                                <button className="btn-delete" onClick={handleDelete}>delete</button>
                            </div>
                        </div>
                    )}

                    {(isEditing || isAdding) && (
                        <div className="table-row edit-row">
                            <div className="col-type">
                                <strong>{isAdding ? 'New Address' : 'Home'}</strong>
                            </div>
                            <div className="col-address">
                                <input
                                    type="text"
                                    name="street"
                                    value={addressData.street}
                                    onChange={handleAddressChange}
                                    placeholder="Street Address"
                                    className="address-input"
                                />
                                <div className="address-row">
                                    <input
                                        type="text"
                                        name="city"
                                        value={addressData.city}
                                        onChange={handleAddressChange}
                                        placeholder="City"
                                        className="address-input small"
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        value={addressData.state}
                                        onChange={handleAddressChange}
                                        placeholder="State"
                                        className="address-input small"
                                    />
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={addressData.zipCode}
                                        onChange={handleAddressChange}
                                        placeholder="ZIP"
                                        className="address-input small"
                                    />
                                </div>
                            </div>
                            <div className="col-actions">
                                <button
                                    className="btn-save"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'save'}
                                </button>
                                <button className="btn-cancel" onClick={handleCancel}>cancel</button>
                            </div>
                        </div>
                    )}

                    {!hasAddress && !isAdding && !isEditing && (
                        <div className="no-address">
                            <p>No addresses added yet. Click "Add A New Address" below to add one.</p>
                        </div>
                    )}
                </div>

                {!isEditing && !isAdding && (
                    <button className="btn-add-new" onClick={handleAddNew}>
                        Add A New Address
                    </button>
                )}
            </div>
        </div>
    );
};

export default MyAddresses;
