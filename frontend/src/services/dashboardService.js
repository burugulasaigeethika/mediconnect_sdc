// API Service Placeholders for Dashboard Operations
// This file contains mock functions that will be replaced with actual API calls

import API_CONFIG from '../config/api';

const API_BASE_URL = `${API_CONFIG.BASE_URL}`;

// ============================================
// DOCTOR DASHBOARD SERVICES
// ============================================

export const getDoctorProfile = async () => {
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/doctors/profile`).then(res => res.json());

    return {
        success: true,
        data: {
            id: 1,
            name: 'Dr. John Smith',
            specialty: 'Cardiologist',
            email: 'dr.smith@mediconnect.com',
            phone: '+1 234 567 8900',
            qualifications: 'MBBS, MD (Cardiology), FACC',
            experience: 15,
            consultationFee: 1500
        }
    };
};

export const updateDoctorProfile = async (profileData) => {
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/doctors/profile`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(profileData)
    // }).then(res => res.json());

    return {
        success: true,
        message: 'Profile updated successfully'
    };
};

export const getDoctorAppointments = async (status = 'all') => {
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/doctors/appointments?status=${status}`).then(res => res.json());

    return {
        success: true,
        data: [
            { id: 1, patient: 'John Doe', time: '10:00 AM', date: '2025-11-29', type: 'Consultation', status: 'upcoming' },
            { id: 2, patient: 'Jane Smith', time: '11:30 AM', date: '2025-11-29', type: 'Follow-up', status: 'upcoming' },
            { id: 3, patient: 'Robert Johnson', time: '2:00 PM', date: '2025-11-28', type: 'Consultation', status: 'completed' },
        ]
    };
};

export const updateAppointment = async (appointmentId, updateData) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Appointment updated successfully'
    };
};

export const updateDoctorSchedule = async (scheduleData) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Schedule updated successfully'
    };
};

// ============================================
// PHARMACIST DASHBOARD SERVICES
// ============================================

export const getPrescriptions = async (status = 'all') => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: [
            { id: 1, patient: 'John Doe', uploadedAt: '2025-11-28 10:30 AM', status: 'pending', imageUrl: null },
            { id: 2, patient: 'Jane Smith', uploadedAt: '2025-11-28 09:15 AM', status: 'validated', imageUrl: null },
            { id: 3, patient: 'Robert Johnson', uploadedAt: '2025-11-27 04:20 PM', status: 'processed', imageUrl: null },
        ]
    };
};

export const uploadPrescription = async (prescriptionFile) => {
    // TODO: Replace with actual API call with FormData
    return {
        success: true,
        message: 'Prescription uploaded successfully'
    };
};

export const validatePrescription = async (prescriptionId) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Prescription validated'
    };
};

export const getInventory = async () => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: [
            { id: 1, name: 'Paracetamol 500mg', stock: 450, minStock: 100, price: 25, category: 'Pain Relief' },
            { id: 2, name: 'Amoxicillin 250mg', stock: 180, minStock: 100, price: 120, category: 'Antibiotic' },
            { id: 3, name: 'Metformin 500mg', stock: 45, minStock: 100, price: 85, category: 'Diabetes' },
        ]
    };
};

export const updateStock = async (medicineId, newStock) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Stock updated successfully'
    };
};

export const getPharmacyOrders = async () => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: [
            { id: 1, orderId: 'ORD001', customer: 'John Doe', items: 3, amount: 1250, payment: 'Paid', status: 'Delivered' },
            { id: 2, orderId: 'ORD002', customer: 'Jane Smith', items: 5, amount: 2480, payment: 'Paid', status: 'Processing' },
        ]
    };
};

export const processOrder = async (orderData) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Order processed successfully',
        orderId: 'ORD' + Math.floor(Math.random() * 10000)
    };
};

// ============================================
// ADMIN DASHBOARD SERVICES
// ============================================

export const getAdminAnalytics = async (period = '7days') => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: {
            totalUsers: 1248,
            activeDoctors: 45,
            totalAppointments: 856,
            totalRevenue: 2400000,
            appointmentTrends: [
                { day: 'Mon', count: 120 },
                { day: 'Tue', count: 150 },
                { day: 'Wed', count: 110 },
                { day: 'Thu', count: 170 },
                { day: 'Fri', count: 140 },
                { day: 'Sat', count: 90 },
                { day: 'Sun', count: 60 },
            ],
            revenueBreakdown: {
                consultations: 1200000,
                medicines: 850000,
                labTests: 350000
            },
            medicineSales: {
                painRelief: 35,
                antibiotics: 25,
                diabetes: 25,
                others: 15
            }
        }
    };
};

export const getAllUsers = async (role = 'all') => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: {
            doctors: [
                { id: 1, name: 'Dr. John Smith', specialty: 'Cardiologist', status: 'active', patients: 156 },
                { id: 2, name: 'Dr. Sarah Williams', specialty: 'Pediatrician', status: 'active', patients: 203 },
            ],
            patients: [
                { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2025-01-15', appointments: 12 },
            ],
            pharmacists: [
                { id: 1, name: 'Robert Johnson', pharmacy: 'MediConnect Pharmacy', status: 'active', orders: 450 },
            ]
        }
    };
};

export const getPendingDoctors = async () => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: [
            { id: 4, name: 'Dr. Emily Davis', specialty: 'Dermatologist', appliedDate: '2025-11-25', qualifications: 'MBBS, MD' },
            { id: 5, name: 'Dr. James Wilson', specialty: 'Orthopedic', appliedDate: '2025-11-26', qualifications: 'MBBS, MS' },
        ]
    };
};

export const approveDoctor = async (doctorId) => {
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/approve`, {
    //     method: 'POST'
    // }).then(res => res.json());

    return {
        success: true,
        message: 'Doctor approved successfully'
    };
};

export const rejectDoctor = async (doctorId, reason) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Doctor application rejected'
    };
};

export const getAllAppointments = async () => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: [
            { id: 1, appointmentId: 'APT001', patient: 'John Doe', doctor: 'Dr. Smith', date: '2025-11-29', time: '10:00 AM', status: 'Scheduled' },
            { id: 2, appointmentId: 'APT002', patient: 'Jane Smith', doctor: 'Dr. Williams', date: '2025-11-29', time: '11:30 AM', status: 'In Progress' },
        ]
    };
};

export const getAllTransactions = async (type = 'all') => {
    // TODO: Replace with actual API call
    return {
        success: true,
        data: [
            { id: 1, transactionId: 'TXN001', user: 'John Doe', type: 'Consultation', amount: 1500, paymentMethod: 'Razorpay', status: 'Success', date: '2025-11-28' },
            { id: 2, transactionId: 'TXN002', user: 'Jane Smith', type: 'Medicine', amount: 2480, paymentMethod: 'Stripe', status: 'Success', date: '2025-11-28' },
        ]
    };
};

export const generateReport = async (reportType, period) => {
    // TODO: Replace with actual API call
    return {
        success: true,
        message: 'Report generated successfully',
        downloadUrl: '/reports/monthly-report.pdf'
    };
};

// ============================================
// PAYMENT INTEGRATION PLACEHOLDERS
// ============================================

export const initiateRazorpayPayment = async (orderData) => {
    // TODO: Integrate with Razorpay SDK
    console.log('Razorpay payment initiated', orderData);
    return {
        success: true,
        paymentId: 'pay_' + Math.random().toString(36).substr(2, 9)
    };
};

export const initiateStripePayment = async (orderData) => {
    // TODO: Integrate with Stripe SDK
    console.log('Stripe payment initiated', orderData);
    return {
        success: true,
        paymentId: 'pi_' + Math.random().toString(36).substr(2, 9)
    };
};

export default {
    // Doctor services
    getDoctorProfile,
    updateDoctorProfile,
    getDoctorAppointments,
    updateAppointment,
    updateDoctorSchedule,

    // Pharmacist services
    getPrescriptions,
    uploadPrescription,
    validatePrescription,
    getInventory,
    updateStock,
    getPharmacyOrders,
    processOrder,

    // Admin services
    getAdminAnalytics,
    getAllUsers,
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    getAllAppointments,
    getAllTransactions,
    generateReport,

    // Payment services
    initiateRazorpayPayment,
    initiateStripePayment
};
