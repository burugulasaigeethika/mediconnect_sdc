import axios from 'axios';
import API_CONFIG from '../config/api';

// Ensure auth headers are included in requests
const ensureAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

/**
 * Send prescription for an appointment (doctor only)
 * @param {string} appointmentId - ID of the appointment  
 * @param {FormData} formData - FormData containing prescription file
 */
export const sendPrescriptionForAppointment = async (appointmentId, formData) => {
    const token = localStorage.getItem('token');
    return axios.post(
        `${API_CONFIG.BASE_URL}/appointments/${appointmentId}/send-prescription`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    );
};

/**
 * Get doctor's appointments
 */
export const getDoctorAppointments = async () => {
    return axios.get(`${API_CONFIG.BASE_URL}/doctor/appointments`, ensureAuthHeaders());
};

export default {
    sendPrescriptionForAppointment,
    getDoctorAppointments
};
