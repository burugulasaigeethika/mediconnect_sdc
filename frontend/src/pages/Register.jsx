import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import targetIcon from '../assets/images/target-icon.png';

const Register = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        // Step 2: Account Details
        password: '',
        confirmPassword: '',
        // Step 3: Health Profile  
        sex: '',
        insuranceProvider: '',
        allergies: '',
        medicalConditions: '',
        currentMedications: '',
        role: 'patient',
        termsAccepted: false
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
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender) {
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
        setLoading(true);

        // Prepare registration data
        const registerData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 'patient',
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            emergencyContact: {
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone
            },
            insuranceProvider: formData.insuranceProvider,
            allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
            currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(m => m.trim()).filter(m => m) : [],
            medicalHistory: formData.medicalConditions ? [{
                condition: formData.medicalConditions,
                diagnosedDate: new Date(),
                notes: ''
            }] : []
        };

        const result = await register(registerData);

        if (result.success) {
            navigate('/dashboard');
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
                            <div className="icon-badge">
                                🏥
                            </div>
                            <h1>Patient Registration</h1>
                            <p>Create your personal health account</p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="registration-steps">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
                                <div className="step-label">Personal Info</div>
                            </div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                                <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
                                <div className="step-label">Account Details</div>
                            </div>
                            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                                <div className="step-number">3</div>
                                <div className="step-label">Health Profile</div>
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
                                            placeholder="john.doe@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone" className="form-label">Phone Number *</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                className="form-input"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 123-4567"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
                                            <input
                                                type="date"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                className="form-input"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="gender" className="form-label">Gender *</label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                className="form-select"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer-not-to-say">Prefer not to say</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="emergencyContactName" className="form-label">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            id="emergencyContactName"
                                            name="emergencyContactName"
                                            className="form-input"
                                            value={formData.emergencyContactName}
                                            onChange={handleChange}
                                            placeholder="Jane Smith"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="emergencyContactPhone" className="form-label">Emergency Contact Phone</label>
                                        <input
                                            type="tel"
                                            id="emergencyContactPhone"
                                            name="emergencyContactPhone"
                                            className="form-input"
                                            value={formData.emergencyContactPhone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 987-6543"
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/login')}>
                                            Back to Login
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={handleNext}>
                                            Next Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Account Details */}
                            {currentStep === 2 && (
                                <div className="form-step">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">Password *</label>
                                        <div className="password-input-container">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                className="form-input"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a strong password"
                                                required
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
                                        {formData.password && (
                                            <div className={`password-strength ${getPasswordStrengthClass()}`}>
                                                {getPasswordStrength()}
                                            </div>
                                        )}
                                        <div className="form-hint">
                                            Password must be at least 6 characters long
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                                        <div className="password-input-container">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                className="form-input"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? (
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

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                            Previous
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={handleNext}>
                                            Next Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Health Profile */}
                            {currentStep === 3 && (
                                <div className="form-step">
                                    <div className="info-box">
                                        <strong>Why we collect this information</strong>
                                        This helps healthcare providers understand your medical history and provide better care.
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="insuranceProvider" className="form-label">Insurance Provider</label>
                                        <input
                                            type="text"
                                            id="insuranceProvider"
                                            name="insuranceProvider"
                                            className="form-input"
                                            value={formData.insuranceProvider}
                                            onChange={handleChange}
                                            placeholder="e.g., Blue Cross Blue Shield"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="allergies" className="form-label">Allergies</label>
                                        <textarea
                                            id="allergies"
                                            name="allergies"
                                            className="form-input"
                                            value={formData.allergies}
                                            onChange={handleChange}
                                            placeholder="List any allergies (e.g., penicillin, peanuts, latex)"
                                            rows="3"
                                        />
                                        <div className="form-hint">
                                            Separate multiple allergies with commas
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="medicalConditions" className="form-label">Existing Medical Conditions</label>
                                        <textarea
                                            id="medicalConditions"
                                            name="medicalConditions"
                                            className="form-input"
                                            value={formData.medicalConditions}
                                            onChange={handleChange}
                                            placeholder="List any chronic conditions or ongoing treatments"
                                            rows="3"
                                        />
                                        <div className="form-hint">
                                            Include conditions like diabetes, hypertension, asthma, etc.
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="currentMedications" className="form-label">Current Medications</label>
                                        <textarea
                                            id="currentMedications"
                                            name="currentMedications"
                                            className="form-input"
                                            value={formData.currentMedications}
                                            onChange={handleChange}
                                            placeholder="List medications you're currently taking"
                                            rows="3"
                                        />
                                        <div className="form-hint">
                                            Include dosage and frequency if possible. Separate with commas.
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="termsAccepted"
                                                checked={formData.termsAccepted}
                                                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                                required
                                            />
                                            <span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link> *</span>
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                            Previous
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={loading || !formData.termsAccepted}>
                                            {loading ? 'Creating Account...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="auth-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">Sign in</Link>
                            </p>
                            <p>
                                Are you an administrator?{' '}
                                <Link to="/register/admin" className="auth-link">Register as Admin</Link>
                            </p>
                        </div>
                    </div>

                    <div className="auth-visual">
                        <div className="visual-content">
                            <div className="visual-icon">
                                <img src={targetIcon} alt="Get Started" />
                            </div>
                            <h2>Get Started Today</h2>
                            <p>Access top doctors, online consultations, and medicines all in one place</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;