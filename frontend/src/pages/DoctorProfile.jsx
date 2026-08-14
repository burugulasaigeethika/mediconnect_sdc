import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './DoctorProfile.css';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingForm, setBookingForm] = useState({
        appointmentDate: '',
        timeSlot: { startTime: '', endTime: '' },
        symptoms: '',
        consultationType: 'in-person'
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            const response = await axios.get(`/api/doctors/${id}`);
            setDoctor(response.data);
        } catch (error) {
            console.error('Error fetching doctor:', error);
            showToast('Failed to load doctor profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, show: false });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startTime' || name === 'endTime') {
            setBookingForm({
                ...bookingForm,
                timeSlot: { ...bookingForm.timeSlot, [name]: value }
            });
        } else {
            setBookingForm({ ...bookingForm, [name]: value });
        }
    };

    const handleBooking = (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmBooking = async () => {
        try {
            const token = localStorage.getItem('token');

            // Format time slot as a string "Start - End"
            const formattedTimeSlot = `${bookingForm.timeSlot.startTime} - ${bookingForm.timeSlot.endTime}`;

            // Create appointment using the CORRECT booking endpoint
            await axios.post('/api/appointments', {
                doctorId: id,
                appointmentDate: bookingForm.appointmentDate, // Field name must match backend (appointmentDate)
                timeSlot: formattedTimeSlot,
                reason: bookingForm.symptoms, // Map symptoms to reason field which backend expects
                consultationType: bookingForm.consultationType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowConfirmModal(false);
            showToast('Appointment booked successfully! Doctor will review your request.', 'success');
            setTimeout(() => navigate('/appointments'), 2000);
        } catch (error) {
            console.error('Booking error:', error);
            setShowConfirmModal(false);
            showToast(error.response?.data?.message || 'Failed to book appointment', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="container section">
                <div className="empty-state">
                    <h2>Doctor not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-profile-page">
            <div className="container">
                <div className="profile-grid">
                    {/* Doctor Info */}
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {doctor.name.charAt(0)}
                            </div>
                            <div>
                                <h1>{doctor.name}</h1>
                                <p className="profile-spec">
                                    <span className="badge badge-primary">{doctor.specialization || 'General Practice'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-row">
                                <span className="detail-label">🎓 Qualifications</span>
                                <span className="detail-value">{doctor.qualifications || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">💼 Experience</span>
                                <span className="detail-value">{doctor.experience || 0} years</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">💰 Consultation Fee</span>
                                <span className="detail-value">${doctor.consultationFee || 50}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">📧 Email</span>
                                <span className="detail-value">{doctor.email}</span>
                            </div>
                            {doctor.phone && (
                                <div className="detail-row">
                                    <span className="detail-label">📞 Phone</span>
                                    <span className="detail-value">{doctor.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="booking-card">
                        <h2>Book Appointment</h2>



                        <form onSubmit={handleBooking} className="booking-form">
                            <div className="form-group">
                                <label htmlFor="appointmentDate" className="form-label">Appointment Date</label>
                                <input
                                    type="date"
                                    id="appointmentDate"
                                    name="appointmentDate"
                                    className="form-input"
                                    value={bookingForm.appointmentDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startTime" className="form-label">Start Time</label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        name="startTime"
                                        className="form-input"
                                        value={bookingForm.timeSlot.startTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime" className="form-label">End Time</label>
                                    <input
                                        type="time"
                                        id="endTime"
                                        name="endTime"
                                        className="form-input"
                                        value={bookingForm.timeSlot.endTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="consultationType" className="form-label">Consultation Type</label>
                                <select
                                    id="consultationType"
                                    name="consultationType"
                                    className="form-select"
                                    value={bookingForm.consultationType}
                                    onChange={handleInputChange}
                                >
                                    <option value="in-person">🏥 In-Person Visit</option>
                                    <option value="video">🌐 Video Call (Online)</option>
                                    <option value="phone">📞 Phone Call</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="symptoms" className="form-label">Symptoms / Reason for Visit</label>
                                <textarea
                                    id="symptoms"
                                    name="symptoms"
                                    className="form-textarea"
                                    value={bookingForm.symptoms}
                                    onChange={handleInputChange}
                                    placeholder="Describe your symptoms or reason for the appointment..."
                                    rows="4"
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block">
                                Book Appointment
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Booking</h3>
                        <p>Are you sure you want to confirm this booking?</p>
                        <div className="booking-summary" style={{ margin: '15px 0', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                            <p><strong>Doctor:</strong> {doctor.name}</p>
                            <p><strong>Date:</strong> {bookingForm.appointmentDate}</p>
                            <p><strong>Time:</strong> {bookingForm.timeSlot.startTime} - {bookingForm.timeSlot.endTime}</p>
                            <p><strong>Type:</strong> {bookingForm.consultationType}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmBooking}>Confirm Booking</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={handleCloseToast}
                />
            )}
        </div>
    );
};

export default DoctorProfile;
