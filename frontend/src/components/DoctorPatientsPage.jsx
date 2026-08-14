import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './DoctorPatientsPage.css';

const DoctorPatientsPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [filter, setFilter] = useState('All Patients');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        fetchPatients();
    }, [filter, search]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/doctor/patients', {
                params: { status: filter, search },
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patients');
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

    const handleStatusUpdate = async (patientId, newStatus, reason = '') => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = newStatus === 'accepted' ? 'accept' : 'reject';

            await axios.patch(`/api/doctor/patients/${patientId}/${endpoint}`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update UI locally
            setPatients(prev => prev.map(p => {
                if (p._id === patientId) {
                    return { ...p, status: newStatus };
                }
                return p;
            }));

            // Show success message
            showToast(`Patient ${newStatus} successfully`, 'success');

            if (newStatus === 'rejected') {
                closeRejectModal();
            } else if (newStatus === 'accepted') {
                closeAcceptModal();
            }
        } catch (err) {
            console.error(`Error updating status to ${newStatus}:`, err);
            showToast('Failed to update status', 'error');
        }
    };

    const openRejectModal = (patientId) => {
        setSelectedPatientId(patientId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedPatientId(null);
        setRejectionReason('');
    };

    const confirmRejection = () => {
        if (!rejectionReason.trim()) {
            showToast('Please provide a reason for rejection', 'error');
            return;
        }
        handleStatusUpdate(selectedPatientId, 'rejected', rejectionReason);
    };

    const openAcceptModal = (patientId) => {
        setSelectedPatientId(patientId);
        setShowAcceptModal(true);
    };

    const closeAcceptModal = () => {
        setShowAcceptModal(false);
        setSelectedPatientId(null);
    };

    const confirmAccept = () => {
        handleStatusUpdate(selectedPatientId, 'accepted');
    };

    return (
        <div className="doctor-patients-page">
            <div className="content-header">
                <h1>My Patients</h1>
                <div className="header-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            className="form-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                {['All Patients', 'New Patients', 'Pending Records'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading ? <div className="loading">Loading...</div> : (
                <div className="patients-list">
                    {patients.length === 0 ? (
                        <p className="no-data">No patients found.</p>
                    ) : (
                        patients.map(patient => (
                            <div key={patient.doctorPatientId} className="patient-row-card">
                                <div className="patient-avatar">
                                    {patient.avatar ? (
                                        <img src={patient.avatar} alt={patient.name} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {patient.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="patient-details">
                                    <h3>{patient.name}</h3>
                                    <span className="patient-id">{patient.patientId}</span>
                                </div>

                                <div className="patient-info-middle">
                                    <div className="info-item">
                                        <label>Last Visit</label>
                                        <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                                    </div>
                                    {patient.appointmentDate && (
                                        <div className="info-item">
                                            <label>Next Appointment</label>
                                            <span>
                                                {new Date(patient.appointmentDate).toLocaleDateString()}
                                                {patient.appointmentTime && ` at ${patient.appointmentTime}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="status-badge-container">
                                    <span className={`status-badge ${patient.status}`}>
                                        {patient.status}
                                    </span>
                                </div>

                                <div className="patient-actions">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => openAcceptModal(patient._id)}
                                        disabled={patient.status === 'accepted'}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => openRejectModal(patient._id)}
                                        disabled={patient.status === 'rejected'}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reject Patient</h3>
                        <p>Are you sure you want to reject this patient? Please provide a reason.</p>
                        <textarea
                            className="form-textarea"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection (will be sent to patient)..."
                            rows={4}
                            style={{ width: '100%', marginTop: '10px', marginBottom: '20px' }}
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeRejectModal}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmRejection}>Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accept Modal */}
            {showAcceptModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Accept Patient</h3>
                        <p>Are you sure you want to accept this patient?</p>
                        <p className="text-sm text-gray-500" style={{ marginTop: '10px', marginBottom: '20px' }}>
                            This will confirm the appointment and send a notification to the patient.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeAcceptModal}>Cancel</button>
                            <button className="btn btn-success" onClick={confirmAccept}>Confirm Accept</button>
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

export default DoctorPatientsPage;
