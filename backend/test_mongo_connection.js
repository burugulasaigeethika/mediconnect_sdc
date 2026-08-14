const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing Mongo Connection...');
console.log('URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined'); // Mask actual URI

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
