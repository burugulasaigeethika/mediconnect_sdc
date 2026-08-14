const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const DoctorPatient = require('./models/DoctorPatient');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // 1. Find a doctor
        const doctor = await Doctor.findOne();
        if (!doctor) {
            console.error('❌ No doctor found. Please run seedDoctors.js first.');
            process.exit(1);
        }
        console.log(`👨‍⚕️ Using Doctor: ${doctor.name}`);

        // 2. Create Sample Patients
        const patientsData = [
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: 'password123',
                role: 'patient',
                phone: '555-0101',
                profileImage: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random',
                address: { city: 'New York', state: 'NY' }
            },
            {
                name: 'Bob Smith',
                email: 'bob@example.com',
                password: 'password123',
                role: 'patient',
                phone: '555-0102',
                profileImage: 'https://ui-avatars.com/api/?name=Bob+Smith&background=random',
                address: { city: 'Los Angeles', state: 'CA' }
            },
            {
                name: 'Charlie Brown',
                email: 'charlie@example.com',
                password: 'password123',
                role: 'patient',
                phone: '555-0103',
                profileImage: 'https://ui-avatars.com/api/?name=Charlie+Brown&background=random',
                address: { city: 'Chicago', state: 'IL' }
            },
            {
                name: 'Diana Prince',
                email: 'diana@example.com',
                password: 'password123',
                role: 'patient',
                phone: '555-0104',
                profileImage: 'https://ui-avatars.com/api/?name=Diana+Prince&background=random',
                address: { city: 'Houston', state: 'TX' }
            },
            {
                name: 'Evan Wright',
                email: 'evan@example.com',
                password: 'password123',
                role: 'patient',
                phone: '555-0105',
                profileImage: 'https://ui-avatars.com/api/?name=Evan+Wright&background=random',
                address: { city: 'Phoenix', state: 'AZ' }
            }
        ];

        const createdPatients = [];
        for (const pData of patientsData) {
            let patient = await User.findOne({ email: pData.email });
            if (!patient) {
                patient = await User.create(pData);
                console.log(`👤 Created Patient: ${patient.name}`);
            } else {
                console.log(`👤 Patient exists: ${patient.name}`);
            }
            createdPatients.push(patient);
        }

        // 3. Create Doctor-Patient Relationships
        // Clear existing relationships for this doctor to avoid duplicates/confusion during testing
        await DoctorPatient.deleteMany({ doctorId: doctor._id });
        console.log('🧹 Cleared existing doctor-patient records for this doctor');

        const relationships = [
            { patientId: createdPatients[0]._id, status: 'new', lastVisit: new Date() },
            { patientId: createdPatients[1]._id, status: 'new', lastVisit: new Date(Date.now() - 86400000) }, // 1 day ago
            { patientId: createdPatients[2]._id, status: 'pending', lastVisit: new Date(Date.now() - 172800000) }, // 2 days ago
            { patientId: createdPatients[3]._id, status: 'accepted', lastVisit: new Date(Date.now() - 259200000) }, // 3 days ago
            { patientId: createdPatients[4]._id, status: 'rejected', lastVisit: new Date(Date.now() - 345600000) } // 4 days ago
        ];

        for (const rel of relationships) {
            await DoctorPatient.create({
                doctorId: doctor._id,
                ...rel
            });
        }

        console.log(`✅ Seeded ${relationships.length} doctor-patient relationships.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
