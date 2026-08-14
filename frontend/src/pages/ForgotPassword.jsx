import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/forgot-password', {
                email
            });

            setSuccess(response.data.message);
            
            // Redirect to OTP verification page after 2 seconds
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error sending OTP');
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
                            <h1>Forgot Password</h1>
                            <p>Enter your email to receive a password reset OTP</p>
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
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                Remember your password?{' '}
                                <Link to="/login" className="auth-link">Sign in</Link>
                            </p>
                        </div>
                    </div>

                    <div className="auth-visual">
                        <div className="visual-content">
                            <div className="visual-icon">🔑</div>
                            <h2>Password Recovery</h2>
                            <p>We'll send you a secure OTP to reset your password</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
