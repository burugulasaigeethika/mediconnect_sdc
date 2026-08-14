const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');

const testDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
        
        // Count medicines
        const count = await Medicine.countDocuments();
        console.log(`Total medicines in database: ${count}`);
        
        // Get first 5 medicines
        const medicines = await Medicine.find().limit(5);
        console.log('Sample medicines:');
        medicines.forEach(med => {
            console.log(`- ${med.name} (${med.category}) - ₹${med.price}`);
        });
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

testDB();