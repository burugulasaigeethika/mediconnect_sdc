const mongoose = require('mongoose');
const DoctorPatient = require('./models/DoctorPatient');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
require('dotenv').config();

async function checkDoctorPatients() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');

        // Find Dr. Rohan Iyer
        const doctor = await Doctor.findOne({ email: 'rohan.iyer@mediconnect.com' });

        if (!doctor) {
            console.log('❌ Dr. Rohan Iyer not found');
            process.exit(1);
        }

        console.log(`\n✅ Found doctor: ${doctor.name} (ID: ${doctor._id})\n`);

        // Find all patients for this doctor
        const relations = await DoctorPatient.find({ doctorId: doctor._id })
            .populate('patientId', 'name email');

        console.log(`📋 Patients for Dr. Rohan Iyer: ${relations.length}\n`);

        if (relations.length === 0) {
            console.log('⚠️  No patients found for this doctor!');
            console.log('\nThis means the booking did not create a DoctorPatient relationship.');
            console.log('Please try booking again and check the backend logs for errors.\n');
        } else {
            relations.forEach((rel, index) => {
                console.log(`${index + 1}. ${rel.patientId?.name || 'Unknown'} (${rel.patientId?.email || 'No email'})`);
                console.log(`   Status: ${rel.status}`);
                console.log(`   Last Visit: ${rel.lastVisit}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDoctorPatients();
