import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccessToast } from '../utils/toast';
import PrescriptionUploadModal from './PrescriptionUploadModal';
import './DoctorAppointmentsPage.css';

const DoctorAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Use doctor-specific endpoint that returns appointments where this user is the doctor
            const response = await axios.get('/api/appointments/my-appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const openPrescriptionModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsPrescriptionModalOpen(true);
    };

    const closePrescriptionModal = () => {
        setIsPrescriptionModalOpen(false);
        setSelectedAppointment(null);
    };

    const handlePrescriptionSuccess = (updatedAppointment) => {
        // Update appointment list in local state
        setAppointments((prev) =>
            prev.map((appt) =>
                appt._id === updatedAppointment._id ? updatedAppointment : appt
            )
        );
        // Show success message
        showSuccessToast('Prescription sent successfully to patient\'s email!');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'Pending': 'status-pending',
            'Booked': 'status-booked',
            'Completed': 'status-completed',
            'Cancelled': 'status-cancelled',
            'Rejected': 'status-rejected'
        };
        return statusClasses[status] || 'status-default';
    };

    return (
        <div className="doctor-appointments-page">
            <div className="content-header">
                <h1>My Appointments</h1>
                <p className="subtitle">Manage your appointments and send prescriptions</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading appointments...</div>
            ) : appointments.length === 0 ? (
                <div className="no-data">
                    <p>📅 No appointments scheduled</p>
                </div>
            ) : (
                <div className="appointments-grid">
                    {appointments.map((appointment) => (
                        <div key={appointment._id} className="appointment-card">
                            <div className="appointment-header">
                                <div className="patient-info">
                                    <div className="patient-icon">👤</div>
                                    <div>
                                        <h3>{appointment.patientId?.name || 'Unknown Patient'}</h3>
                                        <span className="patient-id">ID: {appointment.patientId?._id?.slice(-6)}</span>
                                    </div>
                                </div>
                                <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="appointment-details">
                                <div className="detail-row">
                                    <span className="detail-label">📅 Date:</span>
                                    <span>{formatDate(appointment.appointmentDate)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">🕐 Time:</span>
                                    <span>{appointment.timeSlot}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">💻 Type:</span>
                                    <span className={`consultation-type ${appointment.consultationType}`}>
                                        {appointment.consultationType === 'video' ? '🌐 Online' :
                                            appointment.consultationType === 'phone' ? '📞 Phone' : '🏥 In-Person'}
                                    </span>
                                </div>
                                {appointment.reason && (
                                    <div className="detail-row">
                                        <span className="detail-label">📝 Reason:</span>
                                        <span>{appointment.reason}</span>
                                    </div>
                                )}
                            </div>

                            <div className="appointment-actions">
                                {/* Show "Send Prescription" button for online appointments without prescription */}
                                {(appointment.consultationType === 'video' || appointment.consultationType === 'phone') &&
                                    !appointment.hasPrescription &&
                                    appointment.status !== 'Cancelled' &&
                                    appointment.status !== 'Rejected' && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => openPrescriptionModal(appointment)}
                                        >
                                            📤 Send Prescription
                                        </button>
                                    )}

                                {/* Show "Prescription Sent" badge if prescription already uploaded */}
                                {appointment.hasPrescription && (
                                    <div className="prescription-sent-badge">
                                        ✅ Prescription Sent
                                        {appointment.prescriptionSentAt && (
                                            <span className="sent-time">
                                                {new Date(appointment.prescriptionSentAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Prescription Upload Modal */}
            {selectedAppointment && (
                <PrescriptionUploadModal
                    appointment={selectedAppointment}
                    onClose={closePrescriptionModal}
                    onSuccess={handlePrescriptionSuccess}
                />
            )}
        </div>
    );
};

export default DoctorAppointmentsPage;
