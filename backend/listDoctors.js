const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

async function listDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        const doctors = await Doctor.find().select('name email');
        console.log('\n📋 Doctors in database:\n');
        doctors.forEach(d => console.log(`- ${d.name} (${d.email})`));
        console.log('');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listDoctors();
