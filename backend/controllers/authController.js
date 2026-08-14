const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');
const { config } = require('../config/env');
const otpService = require('../services/otpService');
const { blacklistToken } = require('../services/tokenBlacklistService');

// Register
exports.register = async (req, res) => {
    try {
        const {
            name,
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            dateOfBirth,
            gender,
            emergencyContact,
            insuranceProvider,
            allergies,
            currentMedications,
            medicalHistory,
            specialization,
            qualifications,
            experience,
            consultationFee,
            employeeId,
            pharmacyName,
            licenseNumber,
            yearsOfExperience
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        const userData = {
            email,
            password,
            role: role || 'patient',
            phone
        };

        // Add name fields (support both formats for backward compatibility)
        if (firstName && lastName) {
            userData.firstName = firstName;
            userData.lastName = lastName;
            userData.name = `${firstName} ${lastName}`;
        } else if (name) {
            userData.name = name;
        }

        // Add patient-specific fields
        if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
        if (gender) userData.gender = gender;
        if (emergencyContact) userData.emergencyContact = emergencyContact;
        if (insuranceProvider) userData.insuranceProvider = insuranceProvider;
        if (allergies) userData.allergies = allergies;
        if (currentMedications) userData.currentMedications = currentMedications;
        if (medicalHistory) userData.medicalHistory = medicalHistory;

        // Add doctor-specific fields if role is doctor
        if (role === 'doctor') {
            userData.specialization = specialization;
            userData.qualifications = qualifications;
            userData.experience = experience;
            userData.consultationFee = consultationFee;
        }

        // Add pharmacist-specific fields if role is pharmacist
        if (role === 'pharmacist') {
            userData.employeeId = employeeId;
            userData.pharmacyName = pharmacyName;
            userData.licenseNumber = licenseNumber;
            userData.yearsOfExperience = yearsOfExperience;
        }


        const user = new User(userData);
        await user.save();
        console.log('✅ User saved to database:', user._id);

        // Generate JWT token
        console.log('🔐 Generating JWT token...');
        console.log('🔑 JWT Secret exists:', !!config.jwtSecret);
        console.log('🔑 JWT Secret value:', config.jwtSecret ? config.jwtSecret.substring(0, 20) + '...' : 'UNDEFINED');

        if (!config.jwtSecret) {
            console.error('❌ JWT_SECRET is missing from config!');
            throw new Error('JWT_SECRET configuration error');
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Try to find user in User collection
        let user = await User.findOne({ email });
        let role = 'patient';
        let isDoctor = false;

        if (user) {
            // Check password for User
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            role = user.role;
        } else {
            // 2. If not found in User, try Doctor collection (for seeded doctors)
            const doctor = await Doctor.findOne({ email });
            if (doctor) {
                // Check password for Doctor
                const isMatch = await doctor.comparePassword(password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
                user = doctor;
                role = 'doctor';
                isDoctor = true;
            } else {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        }

        // Validate role if specified in request
        if (req.body.role && req.body.role !== role) {
            console.log(`❌ Role mismatch blocked: User ${email} is ${role}, but tried to login as ${req.body.role}`);
            return res.status(403).json({
                message: `Access denied. Please use the ${role} login page.`
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate and store OTP using Redis
        const otpResult = await otpService.generateOTP(email, user._id.toString());

        if (!otpResult.success) {
            return res.status(500).json({
                message: 'Failed to generate OTP. Please try again.',
                error: otpResult.error
            });
        }

        // Send OTP email using the email service
        const emailResult = await sendOTPEmail(email, user.name, otpResult.otp);

        if (!emailResult.success) {
            // Remove OTP if email fails
            await otpService.deleteOTP(email);
            return res.status(500).json({
                message: 'Failed to send OTP email. Please try again.',
                error: emailResult.error
            });
        }

        res.json({
            message: 'OTP sent successfully to your email',
            email: email // Send back for verification page
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        // Clean up OTP on error
        const { email } = req.body;
        if (email) {
            await otpService.deleteOTP(email);
        }
        res.status(500).json({
            message: 'Error sending OTP. Please try again.',
            error: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Verify OTP using Redis service
        const verifyResult = await otpService.verifyOTP(email, otp);

        if (!verifyResult.success) {
            return res.status(400).json({ message: verifyResult.message });
        }

        res.json({
            message: 'OTP verified successfully',
            verified: true
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Error verifying OTP. Please try again.', error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Verify OTP was verified using Redis
        const isVerified = await otpService.isOTPVerified(email);
        if (!isVerified) {
            return res.status(400).json({ message: 'Please verify OTP first' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // Clear OTP from Redis
        await otpService.deleteOTP(email);

        res.json({
            message: 'Password reset successfully',
            success: true
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password. Please try again.', error: error.message });
    }
};

// Logout - Blacklist token
exports.logout = async (req, res) => {
    try {
        const token = req.token; // Set by auth middleware

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        // Add token to blacklist
        await blacklistToken(token);

        res.json({
            message: 'Logged out successfully',
            success: true
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error logging out. Please try again.', error: error.message });
    }
};