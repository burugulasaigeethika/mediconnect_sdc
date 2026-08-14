const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

dotenv.config();

const sampleDoctors = [
    // Cardiology
    {
        name: 'Dr. Arjun Rao',
        email: 'arjun.rao@mediconnect.com',
        phone: '9876543210',
        specialization: 'Cardiology',
        symptomsHandled: ['chest pain', 'blood pressure', 'heart palpitations'],
        experienceYears: 15,
        consultationFee: 800,
        isAvailable: true,
        location: 'Hyderabad',
        rating: 4.9,
        passwordHash: 'doctor123'
    },
    {
        name: 'Dr. Priya Singh',
        email: 'priya.singh@mediconnect.com',
        phone: '9876543211',
        specialization: 'Cardiology',
        symptomsHandled: ['chest pain', 'shortness of breath'],
        experienceYears: 8,
        consultationFee: 600,
        isAvailable: true,
        location: 'Mumbai',
        rating: 4.7,
        passwordHash: 'doctor123'
    },

    // Dermatology
    {
        name: 'Dr. Neha Sharma',
        email: 'neha.sharma@mediconnect.com',
        phone: '9876543212',
        specialization: 'Dermatology',
        symptomsHandled: ['acne', 'rashes', 'hair fall'],
        experienceYears: 10,
        consultationFee: 500,
        isAvailable: true,
        location: 'Delhi',
        rating: 4.8,
        passwordHash: 'doctor123'
    },

    // Neurology
    {
        name: 'Dr. Vivek Patil',
        email: 'vivek.patil@mediconnect.com',
        phone: '9876543213',
        specialization: 'Neurology',
        symptomsHandled: ['migraine', 'headache', 'seizures'],
        experienceYears: 20,
        consultationFee: 1000,
        isAvailable: false,
        location: 'Bangalore',
        rating: 4.9,
        passwordHash: 'doctor123'
    },

    // Pediatrics
    {
        name: 'Dr. Kavya Menon',
        email: 'kavya.menon@mediconnect.com',
        phone: '9876543214',
        specialization: 'Pediatrics',
        symptomsHandled: ['child fever', 'cold', 'cough', 'vaccination'],
        experienceYears: 12,
        consultationFee: 600,
        isAvailable: true,
        location: 'Chennai',
        rating: 4.8,
        passwordHash: 'doctor123'
    },

    // General Medicine
    {
        name: 'Dr. Rohan Iyer',
        email: 'rohan.iyer@mediconnect.com',
        phone: '9876543215',
        specialization: 'General Medicine',
        symptomsHandled: ['fever', 'cold', 'cough', 'fatigue', 'diabetes'],
        experienceYears: 18,
        consultationFee: 400,
        isAvailable: true,
        location: 'Pune',
        rating: 4.6,
        passwordHash: 'doctor123'
    },

    // Orthopedics
    {
        name: 'Dr. Suresh Reddy',
        email: 'suresh.reddy@mediconnect.com',
        phone: '9876543216',
        specialization: 'Orthopedics',
        symptomsHandled: ['knee pain', 'back pain', 'fracture'],
        experienceYears: 14,
        consultationFee: 700,
        isAvailable: true,
        location: 'Hyderabad',
        rating: 4.7,
        passwordHash: 'doctor123'
    },

    // Gynecology
    {
        name: 'Dr. Anjali Gupta',
        email: 'anjali.gupta@mediconnect.com',
        phone: '9876543217',
        specialization: 'Gynecology',
        symptomsHandled: ['pregnancy', 'period issues', 'PCOS'],
        experienceYears: 16,
        consultationFee: 900,
        isAvailable: true,
        location: 'Mumbai',
        rating: 4.9,
        passwordHash: 'doctor123'
    },

    // Dentistry
    {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@mediconnect.com',
        phone: '9876543218',
        specialization: 'Dentistry',
        symptomsHandled: ['toothache', 'cavity', 'braces'],
        experienceYears: 9,
        consultationFee: 500,
        isAvailable: true,
        location: 'Delhi',
        rating: 4.5,
        passwordHash: 'doctor123'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');

        // Drop the collection to remove any old indexes
        try {
            await mongoose.connection.db.dropCollection('doctors');
            console.log('🗑️  Dropped existing doctors collection');
        } catch (error) {
            if (error.code === 26) {
                console.log('ℹ️  Doctors collection does not exist');
            } else {
                throw error;
            }
        }

        // Insert new doctors (pre-save hook will hash passwords)
        for (const doc of sampleDoctors) {
            const newDoctor = new Doctor(doc);
            await newDoctor.save();
        }
        console.log('✅ Sample doctors seeded successfully');

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
