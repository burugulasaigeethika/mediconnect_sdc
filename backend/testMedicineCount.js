const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('./models/Medicine');

dotenv.config();

const testMedicineCount = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');

        // Count total medicines
        const totalMedicines = await Medicine.countDocuments();
        console.log(`Total medicines in database: ${totalMedicines}`);

        // Get sample medicines
        const sampleMedicines = await Medicine.find().limit(5);
        console.log('\nSample medicines:');
        sampleMedicines.forEach(med => {
            console.log(`- ${med.name} (${med.category}) - Stock: ${med.stock}`);
        });

        // Count by category
        const medicinesCategoryCount = await Medicine.countDocuments({ 
            category: { $regex: 'Medicines & Treatments', $options: 'i' } 
        });
        console.log(`\nMedicines & Treatments category count: ${medicinesCategoryCount}`);

        const basicNeedsCategoryCount = await Medicine.countDocuments({ 
            category: { $regex: 'Basic Needs', $options: 'i' } 
        });
        console.log(`Basic Needs category count: ${basicNeedsCategoryCount}`);

        await mongoose.connection.close();
        console.log('\n✅ Test completed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testMedicineCount();