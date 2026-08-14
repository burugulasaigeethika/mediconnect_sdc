import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    // Redirect if no email
    if (!email) {
        navigate('/forgot-password');
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/reset-password', {
                email,
                newPassword: formData.newPassword
            });

            setSuccess(response.data.message);
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-box">
                        <div className="auth-header">
                            <h1>Reset Password</h1>
                            <p>Create a new secure password for your account</p>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    className="form-input"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter new password"
                                    minLength="6"
                                />
                                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Minimum 6 characters
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Confirm new password"
                                    minLength="6"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>

                    <div className="auth-visual">
                        <div className="visual-content">
                            <div className="visual-icon">🔐</div>
                            <h2>New Password</h2>
                            <p>Choose a strong password to keep your account secure</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
