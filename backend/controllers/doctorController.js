const Doctor = require('../models/Doctor');
const DoctorSchedule = require('../models/DoctorSchedule');

/**
 * Get doctor schedule
 */
exports.getSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.userId).select('weeklySchedule');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json({ schedule: doctor.weeklySchedule || [] });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Error fetching schedule', error: error.message });
    }
};

/**
 * Update doctor schedule and generate dated slots
 */
exports.updateSchedule = async (req, res) => {
    try {
        const { weeklySchedule } = req.body;
        const doctorId = req.user.userId;

        console.log('📅 Updating schedule for doctor:', doctorId);

        // Update weekly schedule in Doctor model
        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { weeklySchedule },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        console.log(`✅ Updated weekly schedule for Dr. ${doctor.name}`);

        // Generate dated slots for the next 30 days
        const slots = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dayName = daysOfWeek[currentDate.getDay()];

            // Find matching weekly schedule
            const daySchedule = weeklySchedule?.find(s => s.day === dayName && s.isAvailable);

            if (daySchedule) {
                // Generate hourly slots between start and end time
                const startHour = parseInt(daySchedule.startTime.split(':')[0]);
                const endHour = parseInt(daySchedule.endTime.split(':')[0]);

                for (let hour = startHour; hour < endHour; hour++) {
                    const startTime = `${hour.toString().padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
                    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00 ${(hour + 1) < 12 || (hour + 1) === 24 ? 'AM' : 'PM'}`;

                    // Format for 12-hour display
                    const displayStartHour = hour % 12 || 12;
                    const displayEndHour = (hour + 1) % 12 || 12;
                    const startPeriod = hour < 12 ? 'AM' : 'PM';
                    const endPeriod = (hour + 1) < 12 || (hour + 1) === 24 ? 'AM' : 'PM';

                    slots.push({
                        date: new Date(currentDate),
                        startTime: `${displayStartHour.toString().padStart(2, '0')}:00 ${startPeriod}`,
                        endTime: `${displayEndHour.toString().padStart(2, '0')}:00 ${endPeriod}`,
                        isBooked: false
                    });
                }
            }
        }

        console.log(`📋 Generated ${slots.length} dated slots`);

        // Update or create DoctorSchedule
        let doctorSchedule = await DoctorSchedule.findOne({ doctorId });

        if (doctorSchedule) {
            // Clear old slots and add new ones
            doctorSchedule.slots = slots;
            await doctorSchedule.save();
            console.log('✅ Updated DoctorSchedule with new slots');
        } else {
            // Create new DoctorSchedule
            doctorSchedule = new DoctorSchedule({
                doctorId,
                slots
            });
            await doctorSchedule.save();
            console.log('✅ Created new DoctorSchedule');
        }

        res.json({
            message: 'Schedule updated successfully',
            schedule: doctor.weeklySchedule,
            generatedSlots: slots.length
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Error updating schedule', error: error.message });
    }
};

/**
 * Update doctor profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const doctorId = req.params.id; // From URL param
        const userId = req.user.userId;

        // Ensure doctor is updating their own profile
        if (doctorId !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const {
            name,
            phone,
            specialization,
            experience,
            qualifications,
            consultationFee,
            licenseNumber,
            symptoms
        } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Update fields
        if (name) doctor.name = name;
        if (phone) doctor.phone = phone;
        if (specialization) doctor.specialization = specialization;
        if (experience) doctor.experience = experience;
        if (qualifications) doctor.qualifications = qualifications;
        if (consultationFee) doctor.consultationFee = consultationFee;
        if (licenseNumber) doctor.licenseNumber = licenseNumber;
        if (symptoms) doctor.symptomsHandled = symptoms; // Map sypmtoms to symptomsHandled

        await doctor.save();

        res.json({
            message: 'Profile updated successfully',
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization,
                experience: doctor.experience,
                qualifications: doctor.qualifications,
                consultationFee: doctor.consultationFee,
                licenseNumber: doctor.licenseNumber
            }
        });
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ message: 'Error updating doctor profile' });
    }
};

/**
 * Get doctor dashboard stats
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const doctorId = req.user.userId;

        // Count total patients (unique patients from appointments)
        // Note: This requires Appointment model, assuming we can use it here
        // If not, we'll return 0 or mock until Appointment model is imported

        // Since we don't have Appointment imported at top, let's require it dynamically or mock for now safely
        // Better: count slots that are booked
        const schedule = await DoctorSchedule.findOne({ doctorId });
        let totalPatients = 0;
        let upcomingAppointments = 0;

        if (schedule && schedule.slots) {
            // Count booked slots in the past as "Total Patients" visits (approx)
            // or count total booked slots ever
            totalPatients = schedule.slots.filter(s => s.isBooked).length;

            // Count booked slots in future
            const now = new Date();
            upcomingAppointments = schedule.slots.filter(s => s.isBooked && new Date(s.date) > now).length;
        }

        // Mock "Pending Reports" as it's not clearly defined in models yet
        const pendingReports = 0;

        res.json({
            totalPatients: totalPatients,
            pendingReports: pendingReports,
            upcomingAppointments: upcomingAppointments
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

module.exports = {
    getSchedule: exports.getSchedule,
    updateSchedule: exports.updateSchedule,
    updateProfile: exports.updateProfile,
    getDashboardStats: exports.getDashboardStats
};
