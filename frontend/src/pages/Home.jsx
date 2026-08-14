import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Feature card click handler with authentication check
    const handleFeatureClick = (destination) => {
        if (isAuthenticated) {
            // User is logged in, navigate directly to the feature
            navigate(destination);
        } else {
            // User is not logged in, redirect to login with return URL
            navigate(`/login?redirect=${encodeURIComponent(destination)}`);
        }
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Healthcare Made <span className="highlight">Simple</span>
                        </h1>
                        <p className="hero-subtitle">
                            Book appointments with top doctors, consult online, and get your medicines delivered to your doorstep.
                        </p>
                        <div className="hero-cta">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/doctors" className="btn btn-primary btn-lg">
                                        Find Doctors
                                    </Link>
                                    <Link to="/pharmacy" className="btn btn-accent btn-lg">
                                        Browse Pharmacy
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <div className="pulse-circle"></div>
                            <div className="doctor-icon">🏥</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section features">
                <div className="container">
                    <h2 className="section-title text-center">Why Choose MediConnect?</h2>
                    <p className="section-subtitle text-center">
                        Comprehensive healthcare solutions at your fingertips
                    </p>

                    <div className="grid grid-3">
                        <div className="feature-card" onClick={() => handleFeatureClick('/doctors')}>
                            <div className="feature-icon">👨‍⚕️</div>
                            <h3>Expert Doctors</h3>
                            <p>Find and book appointments with qualified specialists across various fields</p>
                        </div>

                        <div className="feature-card" onClick={() => handleFeatureClick('/appointments')}>
                            <div className="feature-icon">📱</div>
                            <h3>Online Consultations</h3>
                            <p>Get medical advice from the comfort of your home through video consultations</p>
                        </div>

                        <div className="feature-card" onClick={() => handleFeatureClick('/pharmacy')}>
                            <div className="feature-icon">💊</div>
                            <h3>Integrated Pharmacy</h3>
                            <p>Order medicines online with prescription verification and fast delivery</p>
                        </div>

                        <div className="feature-card" onClick={() => handleFeatureClick('/medical-history')}>
                            <div className="feature-icon">📋</div>
                            <h3>Medical Records</h3>
                            <p>Access your complete medical history and prescriptions anytime</p>
                        </div>

                        <div className="feature-card" onClick={() => handleFeatureClick('/dashboard')}>
                            <div className="feature-icon">🔒</div>
                            <h3>Secure & Private</h3>
                            <p>Your medical data is encrypted and protected with industry-standard security</p>
                        </div>

                        <div className="feature-card" onClick={() => handleFeatureClick('/contact')}>
                            <div className="feature-icon">⚡</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock customer support for all your healthcare needs</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section how-it-works">
                <div className="container">
                    <h2 className="section-title text-center">How It Works</h2>
                    <p className="section-subtitle text-center">
                        Get started in three simple steps
                    </p>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up in seconds and set up your health profile</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Find & Book</h3>
                            <p>Search for doctors and book appointments instantly</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Get Care</h3>
                            <p>Consult, receive prescriptions, and order medicines</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Ready to Take Control of Your Health?</h2>
                        <p>Join thousands of patients who trust MediConnect for their healthcare needs</p>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Sign Up Now
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
