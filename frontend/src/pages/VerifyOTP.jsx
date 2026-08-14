import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/verify-otp', {
                email,
                otp
            });

            setSuccess(response.data.message);
            
            // Redirect to reset password page after 1 second
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/forgot-password', {
                email
            });
            setSuccess('OTP resent successfully!');
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error resending OTP');
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
                            <h1>Verify OTP</h1>
                            <p>Enter the 6-digit code sent to {email}</p>
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
                                <label htmlFor="otp" className="form-label">OTP Code</label>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    className="form-input"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    pattern="\d{6}"
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                />
                                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                    OTP expires in 5 minutes
                                </small>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="btn btn-secondary btn-block"
                                disabled={loading}
                                style={{ marginTop: 'var(--spacing-sm)' }}
                            >
                                Resend OTP
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                <Link to="/forgot-password" className="auth-link">Change email address</Link>
                            </p>
                        </div>
                    </div>

                    <div className="auth-visual">
                        <div className="visual-content">
                            <div className="visual-icon">📧</div>
                            <h2>Check Your Email</h2>
                            <p>We've sent a verification code to your email address</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
