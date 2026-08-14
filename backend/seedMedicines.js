const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('./models/Medicine');

dotenv.config();

const sampleMedicines = [
    // Pain Relief & Fever - Medicines & Treatments
    {
        name: 'Paracetamol 500mg',
        genericName: 'Paracetamol',
        manufacturer: 'Apollo Pharmacy',
        category: 'Medicines & Treatments',
        description: 'Effective relief from fever, headache, and body pain',
        mrp: 50,
        discount: 10,
        price: 45,
        stock: 500,
        requiresPrescription: false,
        dosageForm: 'tablet',
        strength: '500mg'
    },
    {
        name: 'Dolo 650',
        description: 'Pain reliever and fever reducer',
        category: 'Medicines & Treatments',
        price: 35,
        mrp: 45,
        discount: 22,
        stock: 150
    },
    {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        manufacturer: 'Sun Pharma',
        category: 'Medicines & Treatments',
        description: 'NSAID for pain, inflammation, and fever',
        mrp: 80,
        discount: 15,
        price: 68,
        stock: 300,
        requiresPrescription: false,
        dosageForm: 'tablet',
        strength: '400mg'
    },
    {
        name: 'Crocin Pain Relief',
        description: 'Fast relief from headache and body pain',
        category: 'Medicines & Treatments',
        price: 40,
        mrp: 50,
        discount: 20,
        stock: 120
    },

    // Cold & Allergy - Medicines & Treatments
    {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine',
        manufacturer: 'Cipla',
        category: 'Medicines & Treatments',
        description: 'Antihistamine for allergy relief',
        mrp: 60,
        discount: 10,
        price: 54,
        stock: 400,
        requiresPrescription: false,
        dosageForm: 'tablet',
        strength: '10mg'
    },
    {
        name: 'Cough Syrup',
        genericName: 'Dextromethorphan',
        manufacturer: 'Dabur',
        category: 'Medicines & Treatments',
        description: 'Relief from dry cough',
        mrp: 150,
        discount: 12,
        price: 132,
        stock: 150,
        requiresPrescription: false,
        dosageForm: 'syrup',
        strength: '100ml'
    },

    // Vitamins - Medicines & Treatments
    {
        name: 'Vitamin C 500mg',
        genericName: 'Ascorbic Acid',
        manufacturer: 'HealthKart',
        category: 'Medicines & Treatments',
        description: 'Immunity booster and antioxidant',
        mrp: 200,
        discount: 25,
        price: 150,
        stock: 600,
        requiresPrescription: false,
        dosageForm: 'tablet',
        strength: '500mg'
    },
    {
        name: 'Multivitamin Capsules',
        genericName: 'Multivitamin',
        manufacturer: 'Centrum',
        category: 'Medicines & Treatments',
        description: 'Daily essential vitamins and minerals',
        mrp: 500,
        discount: 20,
        price: 400,
        stock: 250,
        requiresPrescription: false,
        dosageForm: 'capsule',
        strength: '30 capsules'
    },
    {
        name: 'Vitamin D3 60000 IU',
        genericName: 'Cholecalciferol',
        manufacturer: 'Dr. Reddy\'s',
        category: 'Medicines & Treatments',
        description: 'Bone health and immunity support',
        mrp: 80,
        discount: 15,
        price: 68,
        stock: 300,
        requiresPrescription: false,
        dosageForm: 'capsule',
        strength: '60000 IU'
    },

    // Digestive - Medicines & Treatments
    {
        name: 'ORS Hydration Powder',
        description: 'Restores body fluids and electrolytes',
        category: 'Medicines & Treatments',
        price: 20,
        mrp: 25,
        discount: 20,
        stock: 300
    },
    {
        name: 'Antacid Tablets',
        genericName: 'Aluminium Hydroxide',
        manufacturer: 'Gelusil',
        category: 'Medicines & Treatments',
        description: 'Quick relief from acidity and heartburn',
        mrp: 80,
        discount: 10,
        price: 72,
        stock: 180,
        requiresPrescription: false,
        dosageForm: 'tablet'
    },

    // First Aid & Hygiene - Basic Needs
    {
        name: 'Hand Sanitizer 500ml',
        genericName: 'Alcohol-based sanitizer',
        manufacturer: 'Dettol',
        category: 'Basic Needs',
        description: 'Kills 99.9% germs instantly',
        mrp: 180,
        discount: 20,
        price: 144,
        stock: 500,
        requiresPrescription: false
    },
    {
        name: 'Surgical Face Masks (50 pcs)',
        genericName: 'Face Masks',
        manufacturer: '3M',
        category: 'Basic Needs',
        description: '3-layer disposable face masks',
        mrp: 250,
        discount: 15,
        price: 213,
        stock: 600,
        requiresPrescription: false
    },
    {
        name: 'Antiseptic Cream',
        genericName: 'Betadine',
        manufacturer: 'Mundipharma',
        category: 'Basic Needs',
        description: 'Prevents infection in minor cuts and burns',
        mrp: 80,
        discount: 12,
        price: 70,
        stock: 300,
        requiresPrescription: false
    },
    {
        name: 'Cotton Bandage Roll',
        description: 'Sterile cotton bandage for wound dressing',
        category: 'Basic Needs',
        price: 50,
        mrp: 60,
        discount: 16,
        stock: 200
    },
    {
        name: 'Adhesive Bandages (100 pcs)',
        genericName: 'Bandages',
        manufacturer: 'Band-Aid',
        category: 'Basic Needs',
        description: 'Sterile adhesive bandages',
        mrp: 150,
        discount: 10,
        price: 135,
        stock: 400,
        requiresPrescription: false
    },

    // Personal Care - Basic Needs
    {
        name: 'Digital Thermometer',
        genericName: 'Thermometer',
        manufacturer: 'Omron',
        category: 'Basic Needs',
        description: 'Digital fever thermometer',
        mrp: 300,
        discount: 10,
        price: 270,
        stock: 100,
        requiresPrescription: false
    },
    {
        name: 'Cotton Swabs (200 pcs)',
        genericName: 'Cotton Buds',
        manufacturer: 'Johnson & Johnson',
        category: 'Basic Needs',
        description: 'Sterile cotton swabs',
        mrp: 80,
        discount: 10,
        price: 72,
        stock: 350,
        requiresPrescription: false
    },
    {
        name: 'Disinfectant Spray',
        genericName: 'Surface Disinfectant',
        manufacturer: 'Lysol',
        category: 'Basic Needs',
        description: 'Kills germs on surfaces',
        mrp: 350,
        discount: 12,
        price: 308,
        stock: 200,
        requiresPrescription: false
    },

    // Baby Care - Basic Needs
    {
        name: 'Baby Soap',
        genericName: 'Mild Soap',
        manufacturer: 'Johnson\'s Baby',
        category: 'Basic Needs',
        description: 'Gentle soap for baby skin',
        mrp: 60,
        discount: 15,
        price: 51,
        stock: 250,
        requiresPrescription: false
    },
    {
        name: 'Baby Lotion',
        genericName: 'Moisturizer',
        manufacturer: 'Johnson\'s Baby',
        category: 'Basic Needs',
        description: 'Moisturizing lotion for babies',
        mrp: 180,
        discount: 10,
        price: 162,
        stock: 150,
        requiresPrescription: false
    },

    // Health Monitoring - Basic Needs
    {
        name: 'Glucose Monitor Strips (50 pcs)',
        genericName: 'Test Strips',
        manufacturer: 'Accu-Chek',
        category: 'Basic Needs',
        description: 'Blood glucose test strips',
        mrp: 800,
        discount: 10,
        price: 720,
        stock: 80,
        requiresPrescription: false
    },
    {
        name: 'BP Monitor',
        genericName: 'Blood Pressure Monitor',
        manufacturer: 'Omron',
        category: 'Basic Needs',
        description: 'Digital blood pressure monitor',
        mrp: 2500,
        discount: 15,
        price: 2125,
        stock: 50,
        requiresPrescription: false
    },

    // Eye Care - Medicines & Treatments
    {
        name: 'Eye Drops',
        genericName: 'Carboxymethylcellulose',
        manufacturer: 'Refresh Tears',
        category: 'Medicines & Treatments',
        description: 'Relief from dry eyes',
        mrp: 180,
        discount: 10,
        price: 162,
        stock: 120,
        requiresPrescription: false,
        dosageForm: 'drops',
        strength: '10ml'
    },
    {
        name: 'Pain Relief Gel',
        genericName: 'Diclofenac',
        manufacturer: 'Volini',
        category: 'Medicines & Treatments',
        description: 'Topical pain relief for muscles and joints',
        mrp: 200,
        discount: 15,
        price: 170,
        stock: 150,
        requiresPrescription: false
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');

        // Clear existing sample data to avoid duplicates
        await Medicine.deleteMany({ category: { $in: ['Basic Needs', 'Medicines & Treatments'] } });
        console.log('🗑️  Cleared existing sample data');

        await Medicine.insertMany(sampleMedicines);
        console.log('✅ Sample medicines seeded successfully');

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
