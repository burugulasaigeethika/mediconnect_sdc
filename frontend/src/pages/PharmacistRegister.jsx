import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const PharmacistRegister = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        // Step 2: Professional Details
        pharmacyName: '',
        licenseNumber: '',
        yearsOfExperience: '',
        // Step 3: Account Setup
        password: '',
        confirmPassword: '',
        role: 'pharmacist'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateStep1 = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.employeeId) {
            setError('Please fill in all required fields');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.pharmacyName || !formData.licenseNumber) {
            setError('Please fill in all required fields');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        setError('');

        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        setError('');
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateStep3()) {
            return;
        }

        setLoading(true);

        // Prepare registration data
        const registerData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 'pharmacist',
            employeeId: formData.employeeId,
            pharmacyName: formData.pharmacyName,
            licenseNumber: formData.licenseNumber,
            yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
        };

        const result = await register(registerData);

        if (result.success) {
            navigate('/dashboard/pharmacist');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return '';
        if (password.length < 6) return 'Very Weak';
        if (password.length < 8) return 'Weak';
        if (password.length < 12) return 'Good';
        return 'Strong';
    };

    const getPasswordStrengthClass = () => {
        const strength = getPasswordStrength();
        if (strength === 'Very Weak') return 'strength-very-weak';
        if (strength === 'Weak') return 'strength-weak';
        if (strength === 'Good') return 'strength-good';
        if (strength === 'Strong') return 'strength-strong';
        return '';
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-box">
                        <div className="auth-header">
                            <div className="visual-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
                            <h1>Pharmacist Registration</h1>
                            <p>Create your pharmacist account to manage prescriptions and medications</p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="registration-steps">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
                                <div className="step-label">Personal Info</div>
                            </div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                                <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
                                <div className="step-label">Professional Details</div>
                            </div>
                            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                                <div className="step-number">3</div>
                                <div className="step-label">Account Setup</div>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="form-step">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="firstName" className="form-label">First Name *</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                className="form-input"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="John"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName" className="form-label">Last Name *</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                className="form-input"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="pharmacist.email@pharmacy.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="(123) 456-7890"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="employeeId" className="form-label">Employee ID *</label>
                                        <input
                                            type="text"
                                            id="employeeId"
                                            name="employeeId"
                                            className="form-input"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            placeholder="e.g., PHARM123456"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="btn btn-primary btn-block"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Professional Details */}
                            {currentStep === 2 && (
                                <div className="form-step">
                                    <div className="form-group">
                                        <label htmlFor="pharmacyName" className="form-label">Pharmacy Name *</label>
                                        <input
                                            type="text"
                                            id="pharmacyName"
                                            name="pharmacyName"
                                            className="form-input"
                                            value={formData.pharmacyName}
                                            onChange={handleChange}
                                            placeholder="e.g., City General Pharmacy"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="licenseNumber" className="form-label">Pharmacy License Number *</label>
                                        <input
                                            type="text"
                                            id="licenseNumber"
                                            name="licenseNumber"
                                            className="form-input"
                                            value={formData.licenseNumber}
                                            onChange={handleChange}
                                            placeholder="e.g., PHARM-LIC-12345"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="yearsOfExperience" className="form-label">Years of Experience</label>
                                        <input
                                            type="number"
                                            id="yearsOfExperience"
                                            name="yearsOfExperience"
                                            className="form-input"
                                            value={formData.yearsOfExperience}
                                            onChange={handleChange}
                                            placeholder="e.g., 5"
                                            min="0"
                                            max="50"
                                        />
                                    </div>

                                    <div className="info-box">
                                        <strong>Note:</strong> Your professional information will be verified before your account is activated. This helps maintain trust and quality of pharmaceutical care.
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="btn btn-secondary"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="btn btn-primary"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Account Setup */}
                            {currentStep === 3 && (
                                <div className="form-step">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">Password *</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-input"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                        />
                                        {formData.password && (
                                            <div className={`password-strength ${getPasswordStrengthClass()}`}>
                                                Password Strength: {getPasswordStrength()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            className="form-input"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input type="checkbox" required /> I agree to the{' '}
                                            <Link to="/terms" className="auth-link">Terms of Service</Link>{' '}
                                            and <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="btn btn-secondary"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Completing Registration...' : '🎯 Complete Registration'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="auth-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login/pharmacist" className="auth-link">Sign in here</Link>
                            </p>
                            <p>
                                Are you an administrator?{' '}
                                <Link to="/register/admin" className="auth-link">Register as Admin</Link>
                            </p>
                        </div>
                    </div>

                    <div className="auth-visual">
                        <div className="visual-content">
                            <div className="visual-icon">🎯</div>
                            <h2>Join Our Network</h2>
                            <p>Connect with patients and provide quality pharmaceutical care through our platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacistRegister;