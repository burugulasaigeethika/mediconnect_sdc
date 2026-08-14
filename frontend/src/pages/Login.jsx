import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get redirect destination from query params or state
    const redirectTo = searchParams.get('redirect') || location.state?.from || '/dashboard';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Handle remember me functionality
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        const result = await login(formData.email, formData.password, 'patient');

        if (result.success) {
            // Redirect to the saved path or default to dashboard
            navigate(redirectTo, { replace: true });
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    // Pre-fill email if remembered
    React.useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-box">
                        <div className="auth-header">
                            <h1>Welcome Back</h1>
                            <p>Sign in to access your healthcare dashboard</p>
                        </div>

                        {searchParams.get('redirect') && (
                            <div className="alert alert-info">
                                Please sign in to continue to your requested page.
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="auth-link">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="auth-link">Sign up</Link>
                            </p>
                            <p>
                                Are you an administrator?{' '}
                                <Link to="/register/admin" className="auth-link">Register as Admin</Link>
                            </p>
                        </div>

                        <div className="role-options">
                            <div className="role-options-header">
                                <h3>Healthcare Professional?</h3>
                                <p>Access your dedicated portal by selecting your role below</p>
                            </div>
                            <div className="role-cards">
                                <Link to="/login/doctor" className="role-card">
                                    <div className="role-icon">👨‍⚕️</div>
                                    <div className="role-info">
                                        <h4>Doctor Login</h4>
                                        <p>Access your doctor portal</p>
                                    </div>
                                    <div className="role-arrow">→</div>
                                </Link>
                                <Link to="/login/pharmacist" className="role-card">
                                    <div className="role-icon">💊</div>
                                    <div className="role-info">
                                        <h4>Pharmacist Login</h4>
                                        <p>Access your pharmacy portal</p>
                                    </div>
                                    <div className="role-arrow">→</div>
                                </Link>
                                <Link to="/login/admin" className="role-card">
                                    <div className="role-icon">🔐</div>
                                    <div className="role-info">
                                        <h4>Admin Login</h4>
                                        <p>Access admin portal</p>
                                    </div>
                                    <div className="role-arrow">→</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="auth-visual">
                        <div className="visual-content">
                            <div className="visual-icon">🔐</div>
                            <h2>Secure Access</h2>
                            <p>Your health information is protected with industry-leading security</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;