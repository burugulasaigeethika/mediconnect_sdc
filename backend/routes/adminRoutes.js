const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Order = require('../models/Order'); // Ensure Order model exists or handle safely
// const Prescription = require('../models/Prescription'); // Assuming you have this
const { authMiddleware, authorize } = require('../middleware/auth');

// Middleware to ensure admin access
router.use(authMiddleware, authorize('admin'));

// Get all users (Structured)
router.get('/users', async (req, res) => {
    try {
        console.log('Fetching all users');
        const patients = await User.find({ role: 'patient' }).select('-password');
        const pharmacists = await User.find({ role: 'pharmacist' }).select('-password');
        const doctors = await Doctor.find().select('-passwordHash');

        // Add role field to doctors since the model doesn't have it
        const doctorsWithRole = doctors.map(doc => ({
            ...doc.toObject(),
            role: 'doctor'
        }));

        console.log('Found users:', {
            patients: patients.length,
            pharmacists: pharmacists.length,
            doctors: doctors.length
        });

        res.json({
            patients,
            pharmacists,
            doctors: doctorsWithRole
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Create new user (Handle both User and Doctor collections)
router.post('/users', async (req, res) => {
    try {
        const { role, password, email, ...otherData } = req.body;
        console.log('Creating new user:', { role, email });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        const existingDoctor = await Doctor.findOne({ email });

        if (existingUser || existingDoctor) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        if (role === 'doctor') {
            const doctor = new Doctor({
                email,
                passwordHash: password, // Will be hashed by pre-save hook
                role: 'doctor',
                status: 'active', // Admin created doctors are active by default
                ...otherData
            });
            await doctor.save();
            res.status(201).json(doctor);
        } else {
            const user = new User({
                email,
                password, // Will be hashed by pre-save hook
                role,
                ...otherData
            });
            await user.save();
            res.status(201).json(user);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Delete user (Handle both User and Doctor collections) - Hard Delete (KEEPING THIS FOR REFERENCE OR ADMIN USE IF NEEDED, BUT UI WILL USE DEACTIVATE)
router.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Attempting to delete user with ID:', id);

        // Try deleting from User first
        let deleted = await User.findByIdAndDelete(id);
        console.log('Attempted to delete from User collection:', deleted);

        if (!deleted) {
            // Try deleting from Doctor
            deleted = await Doctor.findByIdAndDelete(id);
            console.log('Attempted to delete from Doctor collection:', deleted);
        }

        if (!deleted) {
            console.log('User not found in either collection');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User deleted successfully');
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Deactivate user (Soft delete)
router.put('/users/:id/deactivate', async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Attempting to deactivate user with ID:', id);

        // Try updating in User first
        let updated = await User.findByIdAndUpdate(id, { status: 'inactive' }, { new: true }).select('-password');
        console.log('Attempted to deactivate in User collection:', updated);

        if (!updated) {
            // Try updating in Doctor
            updated = await Doctor.findByIdAndUpdate(id, { status: 'inactive' }, { new: true }).select('-passwordHash');
            console.log('Attempted to deactivate in Doctor collection:', updated);
        }

        if (!updated) {
            console.log('User not found in either collection');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User deactivated successfully');
        res.json({ message: 'User deactivated successfully', user: updated });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ message: 'Error deactivating user' });
    }
});

// Update user (Handle both User and Doctor collections)
router.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        console.log('Attempting to update user with ID:', id, 'Data:', updateData);

        // Remove fields that shouldn't be updated by admin
        delete updateData._id;
        delete updateData.__v;
        delete updateData.password;
        delete updateData.passwordHash;

        // Try updating in User first
        let updated = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: false  // Disable validation to allow partial updates
        }).select('-password');
        console.log('Attempted to update in User collection:', updated);

        if (!updated) {
            // Try updating in Doctor
            updated = await Doctor.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: false  // Disable validation to allow partial updates
            }).select('-passwordHash');
            console.log('Attempted to update in Doctor collection:', updated);
        }

        if (!updated) {
            console.log('User not found in either collection');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully');
        res.json({ message: 'User updated successfully', user: updated });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Get pending doctor approvals
router.get('/doctors/pending', async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: 'pending' }).select('-passwordHash');
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching pending doctors:', error);
        res.status(500).json({ message: 'Error fetching pending doctors' });
    }
});

// Approve/Reject doctor
router.put('/doctors/:id/approve', async (req, res) => {
    try {
        const { status } = req.body; // 'active', 'rejected'

        if (!['active', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-passwordHash');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json({ message: `Doctor ${status}`, doctor });
    } catch (error) {
        console.error('Error updating doctor status:', error);
        res.status(500).json({ message: 'Error updating doctor status' });
    }
});

// Get pending pharmacist approvals
router.get('/pharmacists/pending', async (req, res) => {
    try {
        const pharmacists = await User.find({
            role: 'pharmacist',
            status: 'pending'
        }).select('-password');
        res.json(pharmacists);
    } catch (error) {
        console.error('Error fetching pending pharmacists:', error);
        res.status(500).json({ message: 'Error fetching pending pharmacists' });
    }
});

// Approve pharmacist
router.put('/pharmacists/:id/approve', async (req, res) => {
    try {
        const pharmacist = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!pharmacist) {
            return res.status(404).json({ message: 'Pharmacist not found' });
        }

        res.json({ message: 'Pharmacist approved successfully', pharmacist });
    } catch (error) {
        console.error('Error approving pharmacist:', error);
        res.status(500).json({ message: 'Error approving pharmacist' });
    }
});

// Reject pharmacist
router.put('/pharmacists/:id/reject', async (req, res) => {
    try {
        const pharmacist = await User.findByIdAndDelete(req.params.id);

        if (!pharmacist) {
            return res.status(404).json({ message: 'Pharmacist not found' });
        }

        res.json({ message: 'Pharmacist rejected successfully' });
    } catch (error) {
        console.error('Error rejecting pharmacist:', error);
        res.status(500).json({ message: 'Error rejecting pharmacist' });
    }
});

// Analytics - Dashboard Stats
router.get('/analytics', async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });
        const totalDoctors = await Doctor.countDocuments();

        // Handle Orders safely if model might not exist or be empty
        let totalOrders = 0;
        let totalRevenue = 0;

        try {
            totalOrders = await Order.countDocuments();
            const orders = await Order.find({ paymentStatus: 'paid' });
            totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        } catch (err) {
            console.log('Order analytics skipped (model issues likely)');
        }

        res.json({
            users: {
                patients: totalPatients,
                doctors: totalDoctors,
                pharmacists: totalPharmacists
            },
            orders: {
                total: totalOrders,
                revenue: totalRevenue
            },
            totalUsers: totalPatients + totalDoctors + totalPharmacists,
            totalRevenue // Add explicit totalRevenue field for easier frontend access
            // Note: totalOrders is already in orders.total
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
