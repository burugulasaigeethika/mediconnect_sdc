const User = require('../models/User');

// Update user profile (name, phone, and health data)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            name,
            phone,
            dateOfBirth,
            gender,
            contactPerson,
            contactRelation,
            contactPhone,
            insuranceProvider,
            allergies,
            currentMedications,
            medicalHistory,
            height,
            weight
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update basic fields
        if (name) user.name = name;
        if (phone) user.phone = phone;

        // Update health/profile fields
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (insuranceProvider) user.insuranceProvider = insuranceProvider;

        // Handle arrays
        if (allergies) user.allergies = allergies;
        if (currentMedications) user.currentMedications = currentMedications;
        if (medicalHistory) user.medicalHistory = medicalHistory;

        // Handle nested objection for emergency contact
        if (contactPerson || contactPhone) {
            user.emergencyContact = {
                name: contactPerson || user.emergencyContact?.name,
                phone: contactPhone || user.emergencyContact?.phone
            };
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                // Return updated health fields
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                emergencyContact: user.emergencyContact,
                insuranceProvider: user.insuranceProvider,
                allergies: user.allergies,
                currentMedications: user.currentMedications,
                medicalHistory: user.medicalHistory
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Update user delivery address
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { address } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update address
        user.address = address;

        await user.save();

        res.json({
            message: 'Address updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                // Include health fields in response to maintain state consistency
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                emergencyContact: user.emergencyContact,
                insuranceProvider: user.insuranceProvider,
                allergies: user.allergies,
                currentMedications: user.currentMedications,
                medicalHistory: user.medicalHistory
            }
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Error updating address' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                // Include health fields
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                emergencyContact: user.emergencyContact,
                insuranceProvider: user.insuranceProvider,
                allergies: user.allergies,
                currentMedications: user.currentMedications,
                medicalHistory: user.medicalHistory
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

module.exports = {
    updateProfile: exports.updateProfile,
    updateAddress: exports.updateAddress,
    getProfile: exports.getProfile
};
