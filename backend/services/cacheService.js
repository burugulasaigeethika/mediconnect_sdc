const redisService = require('./redisService');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * Cache service for frequently accessed data
 * Implements caching with TTL and automatic fallback to database
 */

// Cache TTL constants (in seconds)
const CACHE_TTL = {
    MEDICINES: 30 * 60,      // 30 minutes
    DOCTORS: 30 * 60,         // 30 minutes
    DOCTOR_DETAILS: 15 * 60,  // 15 minutes
    PHARMACY: 15 * 60         // 15 minutes
};

// Cache key prefixes
const CACHE_KEYS = {
    MEDICINES_LIST: 'cache:medicines:list',
    MEDICINES_SEARCH: 'cache:medicines:search:',
    DOCTORS_LIST: 'cache:doctors:list',
    DOCTOR_DETAILS: 'cache:doctor:',
    PHARMACY_INVENTORY: 'cache:pharmacy:inventory'
};

/**
 * Get medicines list with caching
 * @param {Object} query - Query parameters (optional)
 * @returns {Promise<Array>} List of medicines
 */
const getMedicines = async (query = {}) => {
    try {
        const cacheKey = Object.keys(query).length > 0
            ? `${CACHE_KEYS.MEDICINES_SEARCH}${JSON.stringify(query)}`
            : CACHE_KEYS.MEDICINES_LIST;

        // Try to get from cache
        const cached = await redisService.get(cacheKey);
        if (cached) {
            console.log('✅ Cache HIT: medicines');
            return cached;
        }

        console.log('❌ Cache MISS: medicines - fetching from DB');

        // Fetch from database
        const medicines = await Medicine.find(query)
            .select('name manufacturer price stock category')
            .lean();

        // Store in cache
        await redisService.set(cacheKey, medicines, CACHE_TTL.MEDICINES);

        return medicines;
    } catch (error) {
        console.error('Error in getMedicines cache service:', error);
        // Fallback to direct DB query
        return await Medicine.find(query).lean();
    }
};

/**
 * Get doctors list with caching
 * @param {Object} query - Query parameters (optional)
 * @returns {Promise<Array>} List of doctors
 */
const getDoctors = async (query = {}) => {
    try {
        const cacheKey = CACHE_KEYS.DOCTORS_LIST;

        // Try to get from cache
        const cached = await redisService.get(cacheKey);
        if (cached) {
            console.log('✅ Cache HIT: doctors');
            return cached;
        }

        console.log('❌ Cache MISS: doctors - fetching from DB');

        // Fetch from User collection (doctors)
        let doctors = await User.find({ role: 'doctor', ...query })
            .select('name email specialization qualifications experience consultationFee')
            .lean();

        // Also fetch from Doctor collection (seeded doctors)
        const seededDoctors = await Doctor.find(query)
            .select('name email specialization qualifications experience consultationFee')
            .lean();

        // Combine both
        doctors = [...doctors, ...seededDoctors];

        // Store in cache
        await redisService.set(cacheKey, doctors, CACHE_TTL.DOCTORS);

        return doctors;
    } catch (error) {
        console.error('Error in getDoctors cache service:', error);
        // Fallback to direct DB query
        const users = await User.find({ role: 'doctor' }).lean();
        const seeded = await Doctor.find().lean();
        return [...users, ...seeded];
    }
};

/**
 * Get doctor details by ID with caching
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<Object>} Doctor details
 */
const getDoctorById = async (doctorId) => {
    try {
        const cacheKey = `${CACHE_KEYS.DOCTOR_DETAILS}${doctorId}`;

        // Try to get from cache
        const cached = await redisService.get(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT: doctor ${doctorId}`);
            return cached;
        }

        console.log(`❌ Cache MISS: doctor ${doctorId} - fetching from DB`);

        // Try User collection first
        let doctor = await User.findById(doctorId).lean();

        // If not found, try Doctor collection
        if (!doctor) {
            doctor = await Doctor.findById(doctorId).lean();
        }

        if (doctor) {
            // Store in cache
            await redisService.set(cacheKey, doctor, CACHE_TTL.DOCTOR_DETAILS);
        }

        return doctor;
    } catch (error) {
        console.error('Error in getDoctorById cache service:', error);
        // Fallback to direct DB query
        const user = await User.findById(doctorId).lean();
        if (user) return user;
        return await Doctor.findById(doctorId).lean();
    }
};

/**
 * Invalidate medicines cache
 */
const invalidateMedicines = async () => {
    try {
        // Delete all medicine-related cache keys
        const deletedList = await redisService.del(CACHE_KEYS.MEDICINES_LIST);
        const deletedSearch = await redisService.deletePattern(`${CACHE_KEYS.MEDICINES_SEARCH}*`);

        console.log(`🗑️ Invalidated medicine cache: ${deletedList + deletedSearch} keys`);
        return true;
    } catch (error) {
        console.error('Error invalidating medicines cache:', error);
        return false;
    }
};

/**
 * Invalidate doctors cache
 */
const invalidateDoctors = async () => {
    try {
        // Delete all doctor-related cache keys
        await redisService.del(CACHE_KEYS.DOCTORS_LIST);
        await redisService.deletePattern(`${CACHE_KEYS.DOCTOR_DETAILS}*`);

        console.log('🗑️ Invalidated doctors cache');
        return true;
    } catch (error) {
        console.error('Error invalidating doctors cache:', error);
        return false;
    }
};

/**
 * Invalidate specific doctor cache
 * @param {string} doctorId - Doctor ID
 */
const invalidateDoctor = async (doctorId) => {
    try {
        const cacheKey = `${CACHE_KEYS.DOCTOR_DETAILS}${doctorId}`;
        await redisService.del(cacheKey);

        console.log(`🗑️ Invalidated doctor cache: ${doctorId}`);
        return true;
    } catch (error) {
        console.error('Error invalidating doctor cache:', error);
        return false;
    }
};

/**
 * Clear all cache
 */
const clearAllCache = async () => {
    try {
        await invalidateMedicines();
        await invalidateDoctors();
        console.log('🗑️ Cleared all cache');
        return true;
    } catch (error) {
        console.error('Error clearing all cache:', error);
        return false;
    }
};

module.exports = {
    getMedicines,
    getDoctors,
    getDoctorById,
    invalidateMedicines,
    invalidateDoctors,
    invalidateDoctor,
    clearAllCache,
    CACHE_TTL,
    CACHE_KEYS
};
