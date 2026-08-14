const mongoose = require('mongoose');
const DoctorPatient = require('./models/DoctorPatient');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
require('dotenv').config();

async function checkBookings() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB\n');

        // Check all doctor-patient relationships
        const relations = await DoctorPatient.find()
            .populate('doctorId', 'name email')
            .populate('patientId', 'name email');

        console.log(`📋 Total Doctor-Patient Relations: ${relations.length}\n`);

        relations.forEach((rel, index) => {
            console.log(`${index + 1}. Doctor: ${rel.doctorId?.name || 'Unknown'}`);
            console.log(`   Patient: ${rel.patientId?.name || 'Unknown'}`);
            console.log(`   Status: ${rel.status}`);
            console.log(`   Last Visit: ${rel.lastVisit}`);
            console.log('');
        });

        // Check recent appointments
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('doctorId', 'name')
            .populate('patientId', 'name');

        console.log(`\n📅 Recent Appointments: ${appointments.length}\n`);

        appointments.forEach((apt, index) => {
            console.log(`${index + 1}. Doctor: ${apt.doctorId?.name || 'Unknown'}`);
            console.log(`   Patient: ${apt.patientId?.name || 'Unknown'}`);
            console.log(`   Date: ${apt.appointmentDate}`);
            console.log(`   Time: ${apt.timeSlot}`);
            console.log(`   Status: ${apt.status}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkBookings();
