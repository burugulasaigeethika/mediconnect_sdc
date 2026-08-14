import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import DoctorSearchWithRecents from '../components/DoctorSearchWithRecents';
import './Doctors.css';
import './Home.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(null); // 'specialization' or 'symptom'
    const [filterValue, setFilterValue] = useState('');
    const [view, setView] = useState('categories'); // 'categories' or 'list'
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointmentDate: '',
        timeSlot: '',
        reason: '',
        consultationType: 'video'  // Default to video for online consultations
    });

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const specializations = [
        { name: 'Cardiology', icon: '❤️' },
        { name: 'Dermatology', icon: '🧴' },
        { name: 'Neurology', icon: '🧠' },
        { name: 'Pediatrics', icon: '👶' },
        { name: 'General Medicine', icon: '🩺' },
        { name: 'Orthopedics', icon: '🦴' },
        { name: 'Gynecology', icon: '👩' },
        { name: 'Dentistry', icon: '🦷' }
    ];

    const commonSymptoms = [
        { name: 'Fever', icon: '🌡️' },
        { name: 'Cold & Cough', icon: '🤧' },
        { name: 'Headache', icon: '🤕' },
        { name: 'Stomach Pain', icon: '🤢' },
        { name: 'Skin Rash', icon: '🔴' },
        { name: 'Back Pain', icon: '🔙' }
    ];

    useEffect(() => {
        if (view === 'list') {
            fetchDoctors();
        }
    }, [view, activeFilter, filterValue, searchTerm]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            let url = '/api/doctors';
            let params = {};

            if (activeFilter === 'specialization') {
                url = `/api/doctors/specialization/${filterValue}`;
            } else if (activeFilter === 'symptom') {
                url = `/api/doctors/symptom/${filterValue}`;
            } else if (searchTerm) {
                // If searching, use query params for search
                params = { search: searchTerm };
            }

            const response = await axios.get(url, { params });
            if (Array.isArray(response.data)) {
                setDoctors(response.data);
            } else {
                console.error('Expected array of doctors, got:', response.data);
                setDoctors([]);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (type, value) => {
        setActiveFilter(type);
        setFilterValue(value);
        setView('list');
    };

    const handleSearch = (term) => {
        if (term) {
            setActiveFilter(null);
            setFilterValue('');
            setView('list');
            setSearchTerm(term);
        }
    };

    const handleBookClick = (doctor) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/appointments', {
                doctorId: selectedDoctor._id,
                ...bookingData
            });
            showSuccessToast('Appointment booked successfully!');
            setShowBookingModal(false);
            setBookingData({ appointmentDate: '', timeSlot: '', reason: '', consultationType: 'video' });
            navigate('/appointments'); // Redirect to My Appointments
        } catch (error) {
            console.error('Error booking appointment:', error);
            showErrorToast(error.response?.data?.message || 'Error booking appointment');
        }
    };

    return (
        <div className="doctors-page">
            <div className="container">
                {/* Search Bar */}
                <div className="search-container">
                    <DoctorSearchWithRecents
                        onSearch={handleSearch}
                        initialSearchTerm={searchTerm}
                    />
                </div>

                {view === 'categories' ? (
                    <>
                        {/* Specializations Grid */}
                        <section className="category-section">
                            <h2>Find by Specialization</h2>
                            <div className="category-grid">
                                {specializations.map((spec) => (
                                    <div
                                        key={spec.name}
                                        className="category-card"
                                        onClick={() => handleCategoryClick('specialization', spec.name)}
                                    >
                                        <div className="category-icon">{spec.icon}</div>
                                        <h3>{spec.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Symptoms Grid */}
                        <section className="category-section">
                            <h2>Find by Symptoms</h2>
                            <div className="category-grid">
                                {commonSymptoms.map((sym) => (
                                    <div
                                        key={sym.name}
                                        className="category-card"
                                        onClick={() => handleCategoryClick('symptom', sym.name)}
                                    >
                                        <div className="category-icon">{sym.icon}</div>
                                        <h3>{sym.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    /* Doctors List View */
                    <div className="doctors-list-container">
                        <button className="back-btn" onClick={() => setView('categories')}>
                            ← Back to Categories
                        </button>

                        <h2>
                            {activeFilter === 'specialization' ? `${filterValue} Doctors` :
                                activeFilter === 'symptom' ? `Doctors treating ${filterValue} ` :
                                    'Search Results'}
                        </h2>

                        {loading ? (
                            <div className="loading-spinner">Loading...</div>
                        ) : doctors.length > 0 ? (
                            <div className="doctors-grid">
                                {doctors.map((doctor) => (
                                    <div key={doctor._id} className="doctor-card">
                                        <div className="doctor-header">
                                            <h3>{doctor.name}</h3>
                                            {doctor.hasSchedule ? (
                                                doctor.totalAvailableSlots > 0 ? (
                                                    <span className="status-badge available">
                                                        {doctor.totalAvailableSlots} {doctor.totalAvailableSlots === 1 ? 'Slot' : 'Slots'} Available
                                                    </span>
                                                ) : (
                                                    <span className="status-badge unavailable">
                                                        Fully Booked
                                                    </span>
                                                )
                                            ) : (
                                                <span className="status-badge unavailable">
                                                    No Schedule
                                                </span>
                                            )}
                                        </div>
                                        <p className="specialization">{doctor.specialization}</p>
                                        <div className="doctor-details">
                                            <p><strong>Experience:</strong> {doctor.experienceYears} years</p>
                                            <p><strong>Location:</strong> {doctor.location}</p>
                                            <p><strong>Fee:</strong> ₹{doctor.consultationFee}</p>
                                            <p><strong>Rating:</strong> ⭐ {doctor.rating}</p>
                                        </div>

                                        {/* Display Available Slots */}
                                        {doctor.hasSchedule && doctor.availableSlots?.length > 0 && (
                                            <div className="available-slots">
                                                <h4>📅 Upcoming Availability:</h4>
                                                <div className="slots-list">
                                                    {doctor.availableSlots.slice(0, 3).map((slot, idx) => (
                                                        <div key={idx} className="slot-item">
                                                            <span className="slot-date">
                                                                {new Date(slot.date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="slot-time">
                                                                {slot.startTime} - {slot.endTime}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {doctor.totalAvailableSlots > 3 && (
                                                        <p className="more-slots">
                                                            +{doctor.totalAvailableSlots - 3} more slots
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {doctor.symptomsHandled && (
                                            <div className="symptoms-tags">
                                                {doctor.symptomsHandled.map((s, i) => (
                                                    <span key={i} className="tag">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="card-actions">
                                            <button
                                                className="book-btn"
                                                disabled={!doctor.hasSchedule || doctor.totalAvailableSlots === 0}
                                                onClick={() => handleBookClick(doctor)}
                                                title={
                                                    !doctor.hasSchedule ? "Doctor hasn't set schedule yet" :
                                                        doctor.totalAvailableSlots === 0 ? "No slots available" :
                                                            "Book Appointment"
                                                }
                                            >
                                                {!doctor.hasSchedule ? 'No Schedule' :
                                                    doctor.totalAvailableSlots === 0 ? 'Fully Booked' :
                                                        'Book Appointment'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3>No doctors found</h3>
                                <p>Try adjusting your search criteria or browse by category</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Booking Modal */}
                {showBookingModal && selectedDoctor && (
                    <div 
                        className="modal-overlay"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            zIndex: 1100,
                            overflowY: 'auto',
                            padding: '2rem 1rem'
                        }}
                    >
                        <div 
                            className="modal-content"
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '16px',
                                width: '90%',
                                maxWidth: '500px',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                                marginTop: '2rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <h3>Book Appointment</h3>
                            <div className="doctor-summary">
                                <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                                <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                            </div>
                            <form onSubmit={handleBookingSubmit}>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={bookingData.appointmentDate}
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time Slot</label>
                                    <select
                                        required
                                        value={bookingData.timeSlot}
                                        onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                                    >
                                        <option value="">Select a slot</option>
                                        <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                                        <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                                        <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                                        <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                                        <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                                        <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                                        <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                                        <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                                        <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Consultation Type</label>
                                    <select
                                        required
                                        value={bookingData.consultationType}
                                        onChange={(e) => setBookingData({ ...bookingData, consultationType: e.target.value })}
                                    >
                                        <option value="video">🌐 Video Call (Online)</option>
                                        <option value="phone">📞 Phone Call</option>
                                        <option value="in-person">🏥 In-Person Visit</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Reason for Visit</label>
                                    <textarea
                                        required
                                        value={bookingData.reason}
                                        onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                        placeholder="Briefly describe your symptoms..."
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowBookingModal(false)} className="cancel-btn">Cancel</button>
                                    <button type="submit" className="confirm-btn">Confirm Booking</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
