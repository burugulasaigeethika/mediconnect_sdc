import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Toast from '../components/Toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState({ doctors: [], patients: [], pharmacists: [] });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [pendingPharmacists, setPendingPharmacists] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [analytics, setAnalytics] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalPharmacists: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeUserTab, setActiveUserTab] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState(null);
    const [deactivateReason, setDeactivateReason] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'patient', password: '' });
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    useEffect(() => {
        console.log('AdminDashboard useEffect triggered', { isAuthenticated, user });
        if (!isAuthenticated) {
            console.log('Redirecting to admin login');
            navigate('/login/admin');
            return;
        }
        console.log('Fetching dashboard data');
        fetchDashboardData();
    }, [isAuthenticated, navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, show: false });
    };

    const fetchDashboardData = async () => {
        try {
            console.log('Fetching dashboard data...');
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            const [usersRes, pendingDoctorsRes, pendingPharmacistsRes, analyticsRes] = await Promise.all([
                axios.get('/api/admin/users', authHeader),
                axios.get('/api/admin/doctors/pending', authHeader),
                axios.get('/api/admin/pharmacists/pending', authHeader),
                axios.get('/api/admin/analytics', authHeader)
            ]);

            console.log('Received users data:', usersRes.data);
            console.log('Received pending doctors data:', pendingDoctorsRes.data);
            console.log('Received pending pharmacists data:', pendingPharmacistsRes.data);
            console.log('Received analytics data:', analyticsRes.data);

            setUsers(usersRes.data);
            setPendingDoctors(pendingDoctorsRes.data);
            setPendingPharmacists(pendingPharmacistsRes.data);
            setAnalytics(analyticsRes.data);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const approveDoctor = async (doctorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/doctors/${doctorId}/approve`,
                { status: 'active' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPendingDoctors(pendingDoctors.filter(d => d._id !== doctorId)); // Note: MongoDB uses _id not id
            // Optionally refresh users list to move doctor from pending to active list (if we were displaying all doctors in one list, but we separate them)
            fetchDashboardData();
            showToast('Doctor approved successfully!', 'success');
        } catch (error) {
            console.error('Error approving doctor:', error);
            showToast('Failed to approve doctor', 'error');
        }
    };

    const rejectDoctor = async (doctorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/doctors/${doctorId}/approve`,
                { status: 'rejected' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPendingDoctors(pendingDoctors.filter(d => d._id !== doctorId));
            showToast('Doctor application rejected', 'info');
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            showToast('Failed to reject doctor', 'error');
        }
    };

    const approvePharmacist = async (pharmacistId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/pharmacists/${pharmacistId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPendingPharmacists(pendingPharmacists.filter(p => p._id !== pharmacistId));
            fetchDashboardData();
            showToast('Pharmacist approved successfully!', 'success');
        } catch (error) {
            console.error('Error approving pharmacist:', error);
            showToast('Failed to approve pharmacist', 'error');
        }
    };

    const rejectPharmacist = async (pharmacistId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/pharmacists/${pharmacistId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPendingPharmacists(pendingPharmacists.filter(p => p._id !== pharmacistId));
            showToast('Pharmacist application rejected', 'info');
        } catch (error) {
            console.error('Error rejecting pharmacist:', error);
            showToast('Failed to reject pharmacist', 'error');
        }
    };

    const viewUser = (user) => {
        console.log('Viewing user:', user);
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const editUser = (user) => {
        console.log('Editing user:', user);
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const updateUser = async (updatedUserData) => {
        try {
            const token = localStorage.getItem('token');
            console.log('Updating user with data:', updatedUserData);

            const endpoint = `/api/admin/users/${updatedUserData._id}`;
            const response = await axios.put(endpoint, updatedUserData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Update response:', response.data);
            setShowEditModal(false);
            fetchDashboardData();
            showToast('User updated successfully', 'success');
        } catch (error) {
            console.error('Error updating user:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update user';
            showToast(errorMessage, 'error');
        }
    };

    const deactivateUser = (user) => {
        console.log('Opening deactivate confirmation for user:', user);
        setUserToDeactivate(user);
        setShowDeleteModal(true);
        setDeactivateReason('');
    };

    const confirmDeactivate = async () => {
        if (!deactivateReason.trim()) {
            showToast('Please provide a reason for deactivation', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            console.log('Deactivating user:', userToDeactivate._id, 'Reason:', deactivateReason);
            await axios.put(`/api/admin/users/${userToDeactivate._id}/deactivate`, { reason: deactivateReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowDeleteModal(false);
            setUserToDeactivate(null);
            setDeactivateReason('');
            fetchDashboardData();
            showToast('User deactivated successfully', 'success');
        } catch (error) {
            console.error('Error deactivating user:', error);
            showToast('Failed to deactivate user', 'error');
        }
    };

    const openAddModal = () => {
        setNewUser({ name: '', email: '', role: 'patient', password: '', specialization: '', consultationFee: '' });
        setShowAddModal(true);
    };

    const createUser = async (e) => {
        e.preventDefault();

        if (!newUser.name || !newUser.email || !newUser.password) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            console.log('Creating user:', newUser);

            const response = await axios.post('/api/admin/users', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('User created:', response.data);
            setShowAddModal(false);
            setNewUser({ name: '', email: '', role: 'patient', password: '' });
            fetchDashboardData();
            showToast('User created successfully', 'success');
        } catch (error) {
            console.error('Error creating user:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create user';
            showToast(errorMessage, 'error');
        }
    };

    const viewAppointment = (appointment) => {
        console.log('Viewing appointment:', appointment);
        setSelectedAppointment(appointment);
        setShowAppointmentModal(true);
    };

    const handleDownload = async (reportType, fileName) => {
        try {
            showToast(`Generating ${fileName}...`, 'info');
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/reports/${reportType}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showToast(`${fileName} downloaded successfully!`, 'success');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast('Failed to download report', 'error');
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="admin-avatar">🔐</div>
                    <h3>Admin Portal</h3>
                    <p className="admin-role">System Administrator</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="nav-icon">📊</span>
                        Analytics
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <span className="nav-icon">👥</span>
                        User Management
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approvals')}
                    >
                        <span className="nav-icon">✓</span>
                        Approvals
                        {pendingDoctors.length > 0 && <span className="approval-badge">{pendingDoctors.length}</span>}
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <span className="nav-icon">📅</span>
                        Appointments
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        <span className="nav-icon">💰</span>
                        Transactions
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <span className="nav-icon">📈</span>
                        Reports
                    </button>
                </nav>
            </div>

            <div className="dashboard-main">
                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Analytics Dashboard</h1>
                            <select className="form-select" style={{ width: 'auto' }}>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue">👥</div>
                                <div className="stat-info">
                                    <h3>{analytics.totalUsers}</h3>
                                    <p>Total Users</p>
                                    <span className="stat-change positive">+12% this month</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green">👨‍⚕️</div>
                                <div className="stat-info">
                                    <h3>{users.doctors.length}</h3>
                                    <p>Active Doctors</p>
                                    <span className="stat-change positive">+2 new</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">📅</div>
                                <div className="stat-info">
                                    <h3>{analytics.totalOrders}</h3>
                                    <p>Orders & Appointments</p>
                                    <span className="stat-change positive">+8% this week</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">💰</div>
                                <div className="stat-info">
                                    <h3>₹{(analytics.totalRevenue / 1000000).toFixed(1)}M</h3>
                                    <p>Total Revenue</p>
                                    <span className="stat-change positive">+15% this month</span>
                                </div>
                            </div>
                        </div>

                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h2>Appointment Trends</h2>
                                    <button className="btn-link">View Details</button>
                                </div>
                                <div className="chart-container">
                                    <div className="chart-placeholder">
                                        <div className="bar-chart">
                                            <div className="bar" style={{ height: '60%' }}><span>Mon</span></div>
                                            <div className="bar" style={{ height: '75%' }}><span>Tue</span></div>
                                            <div className="bar" style={{ height: '55%' }}><span>Wed</span></div>
                                            <div className="bar" style={{ height: '85%' }}><span>Thu</span></div>
                                            <div className="bar" style={{ height: '70%' }}><span>Fri</span></div>
                                            <div className="bar" style={{ height: '45%' }}><span>Sat</span></div>
                                            <div className="bar" style={{ height: '30%' }}><span>Sun</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-header">
                                    <h2>Revenue Overview</h2>
                                    <button className="btn-link">View Details</button>
                                </div>
                                <div className="chart-container">
                                    <div className="revenue-stats">
                                        <div className="revenue-item">
                                            <span className="revenue-label">Consultations</span>
                                            <span className="revenue-value">₹1.2M</span>
                                            <div className="revenue-bar" style={{ width: '60%' }}></div>
                                        </div>
                                        <div className="revenue-item">
                                            <span className="revenue-label">Medicines</span>
                                            <span className="revenue-value">₹850K</span>
                                            <div className="revenue-bar" style={{ width: '45%' }}></div>
                                        </div>
                                        <div className="revenue-item">
                                            <span className="revenue-label">Lab Tests</span>
                                            <span className="revenue-value">₹350K</span>
                                            <div className="revenue-bar" style={{ width: '20%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>User Management</h1>
                            <button className="btn btn-primary" onClick={openAddModal}>+ Add User</button>
                        </div>

                        <div className="users-section">
                            <div className="users-tabs">
                                <button
                                    className={`tab-btn ${activeUserTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveUserTab('all')}
                                >
                                    All Users ({users.patients.length + users.doctors.length + users.pharmacists.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeUserTab === 'doctors' ? 'active' : ''}`}
                                    onClick={() => setActiveUserTab('doctors')}
                                >
                                    Doctors ({users.doctors.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeUserTab === 'patients' ? 'active' : ''}`}
                                    onClick={() => setActiveUserTab('patients')}
                                >
                                    Patients ({users.patients.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeUserTab === 'pharmacists' ? 'active' : ''}`}
                                    onClick={() => setActiveUserTab('pharmacists')}
                                >
                                    Pharmacists ({users.pharmacists.length})
                                </button>
                            </div>

                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            {activeUserTab === 'all' && <th>Role</th>}
                                            {activeUserTab === 'doctors' && <th>Specialty</th>}
                                            {activeUserTab === 'pharmacists' && <th>Pharmacy</th>}
                                            <th>Status</th>
                                            {activeUserTab === 'doctors' && <th>Patients</th>}
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeUserTab === 'all' && (
                                            <>
                                                {users.patients.map(patient => (
                                                    <tr key={patient._id}>
                                                        <td>{patient.name || `${patient.firstName} ${patient.lastName}`}</td>
                                                        <td>Patient</td>
                                                        <td><span className={`badge badge-${patient.status === 'active' ? 'success' : 'warning'}`}>{patient.status || 'active'}</span></td>
                                                        <td>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => viewUser(patient)}>View</button>
                                                            <button className="btn btn-primary btn-sm" onClick={() => editUser(patient)}>Edit</button>
                                                            <button className="btn btn-accent btn-sm" onClick={() => deactivateUser(patient)}>Deactivate</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.doctors.map(doctor => (
                                                    <tr key={doctor._id}>
                                                        <td>{doctor.name}</td>
                                                        <td>Doctor</td>
                                                        <td>
                                                            <span className={`badge badge-${doctor.status === 'active' ? 'success' : 'warning'}`}>
                                                                {doctor.status || 'pending'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => viewUser(doctor)}>View</button>
                                                            <button className="btn btn-primary btn-sm" onClick={() => editUser(doctor)}>Edit</button>
                                                            <button className="btn btn-accent btn-sm" onClick={() => deactivateUser(doctor)}>Deactivate</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.pharmacists.map(pharmacist => (
                                                    <tr key={pharmacist._id}>
                                                        <td>{pharmacist.name || `${pharmacist.firstName} ${pharmacist.lastName}`}</td>
                                                        <td>Pharmacist</td>
                                                        <td><span className={`badge badge-${pharmacist.status === 'active' ? 'success' : 'warning'}`}>{pharmacist.status || 'active'}</span></td>
                                                        <td>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => viewUser(pharmacist)}>View</button>
                                                            <button className="btn btn-primary btn-sm" onClick={() => editUser(pharmacist)}>Edit</button>
                                                            <button className="btn btn-accent btn-sm" onClick={() => deactivateUser(pharmacist)}>Deactivate</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}
                                        {activeUserTab === 'doctors' && users.doctors.map(doctor => (
                                            <tr key={doctor._id}>
                                                <td>{doctor.name}</td>
                                                <td>{doctor.specialization}</td>
                                                <td>
                                                    <span className={`badge badge-${doctor.status === 'active' ? 'success' : 'warning'}`}>
                                                        {doctor.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td>{doctor.patients || 0}</td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => viewUser(doctor)}>View</button>
                                                    <button className="btn btn-primary btn-sm" onClick={() => editUser(doctor)}>Edit</button>
                                                    <button className="btn btn-accent btn-sm" onClick={() => deactivateUser(doctor)}>Deactivate</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeUserTab === 'patients' && users.patients.map(patient => (
                                            <tr key={patient._id}>
                                                <td>{patient.name || `${patient.firstName} ${patient.lastName}`}</td>
                                                <td>
                                                    <span className={`badge badge-${patient.status === 'active' ? 'success' : 'warning'}`}>{patient.status || 'active'}</span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => viewUser(patient)}>View</button>
                                                    <button className="btn btn-primary btn-sm" onClick={() => editUser(patient)}>Edit</button>
                                                    <button className="btn btn-accent btn-sm" onClick={() => deactivateUser(patient)}>Deactivate</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeUserTab === 'pharmacists' && users.pharmacists.map(pharmacist => (
                                            <tr key={pharmacist._id}>
                                                <td>{pharmacist.name || `${pharmacist.firstName} ${pharmacist.lastName}`}</td>
                                                <td>{pharmacist.pharmacyName || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge badge-${pharmacist.status === 'active' ? 'success' : 'warning'}`}>{pharmacist.status || 'active'}</span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => viewUser(pharmacist)}>View</button>
                                                    <button className="btn btn-primary btn-sm" onClick={() => editUser(pharmacist)}>Edit</button>
                                                    <button className="btn btn-accent btn-sm" onClick={() => deactivateUser(pharmacist)}>Deactivate</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Doctor Approvals</h1>
                            <p>{pendingDoctors.length} pending applications</p>
                        </div>

                        <div className="approvals-section">
                            {pendingDoctors.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">✓</div>
                                    <h3>No Pending Approvals</h3>
                                    <p>All doctor applications have been processed</p>
                                </div>
                            ) : (
                                <div className="approvals-grid">
                                    {pendingDoctors.map(doctor => (
                                        <div key={doctor._id} className="approval-card">
                                            <div className="approval-header">
                                                <div className="doctor-avatar">👨‍⚕️</div>
                                                <div className="doctor-info">
                                                    <h3>{doctor.name}</h3>
                                                    <p>{doctor.specialization}</p>
                                                </div>
                                            </div>
                                            <div className="approval-details">
                                                {doctor.qualifications && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Qualifications:</span>
                                                        <span className="detail-value">{doctor.qualifications}</span>
                                                    </div>
                                                )}
                                                {doctor.experienceYears && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Experience:</span>
                                                        <span className="detail-value">{doctor.experienceYears} years</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <span className="detail-label">Consultation Fee:</span>
                                                    <span className="detail-value">₹{doctor.consultationFee || 'Not set'}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Email:</span>
                                                    <span className="detail-value">{doctor.email}</span>
                                                </div>
                                                {doctor.hospitalAffiliation && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Hospital:</span>
                                                        <span className="detail-value">{doctor.hospitalAffiliation}</span>
                                                    </div>
                                                )}
                                                {doctor.availability && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Availability:</span>
                                                        <span className="detail-value">{doctor.availability}</span>
                                                    </div>
                                                )}
                                                {doctor.education && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Education:</span>
                                                        <span className="detail-value">{doctor.education}</span>
                                                    </div>
                                                )}
                                                {doctor.registrationNumber && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Registration No:</span>
                                                        <span className="detail-value">{doctor.registrationNumber}</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <span className="detail-label">Applied:</span>
                                                    <span className="detail-value">{new Date(doctor.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="approval-actions">
                                                <button className="btn btn-accent" onClick={() => approveDoctor(doctor._id)}>
                                                    ✓ Approve
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => rejectDoctor(doctor._id)}>
                                                    × Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pharmacist Approvals Section */}
                        <div className="content-header" style={{ marginTop: '3rem' }}>
                            <h2>Pharmacist Approvals</h2>
                            <p>{pendingPharmacists.length} pending applications</p>
                        </div>

                        <div className="approvals-section">
                            {pendingPharmacists.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">✓</div>
                                    <h3>No Pending Approvals</h3>
                                    <p>All pharmacist applications have been processed</p>
                                </div>
                            ) : (
                                <div className="approvals-grid">
                                    {pendingPharmacists.map(pharmacist => (
                                        <div key={pharmacist._id} className="approval-card">
                                            <div className="approval-header">
                                                <div className="doctor-avatar">💊</div>
                                                <div className="doctor-info">
                                                    <h3>{pharmacist.name}</h3>
                                                    <p>{pharmacist.pharmacyName || 'Pharmacist'}</p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pharmacist.email}</p>
                                                </div>
                                            </div>
                                            <div className="approval-details">
                                                {pharmacist.pharmacyName && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Pharmacy Name:</span>
                                                        <span className="detail-value">{pharmacist.pharmacyName}</span>
                                                    </div>
                                                )}
                                                {pharmacist.licenseNumber && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">License Number:</span>
                                                        <span className="detail-value">{pharmacist.licenseNumber}</span>
                                                    </div>
                                                )}
                                                {pharmacist.employeeId && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Employee ID:</span>
                                                        <span className="detail-value">{pharmacist.employeeId}</span>
                                                    </div>
                                                )}
                                                {pharmacist.yearsOfExperience && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Years of Experience:</span>
                                                        <span className="detail-value">{pharmacist.yearsOfExperience} years</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <span className="detail-label">Applied:</span>
                                                    <span className="detail-value">{new Date(pharmacist.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="approval-actions">
                                                <button className="btn btn-accent" onClick={() => approvePharmacist(pharmacist._id)}>
                                                    ✓ Approve
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => rejectPharmacist(pharmacist._id)}>
                                                    × Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Appointments Monitoring</h1>
                            <div className="search-box">
                                <input type="text" placeholder="Search appointments..." className="form-input" />
                            </div>
                        </div>

                        <div className="appointments-section">
                            <div className="appointments-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Patient</th>
                                            <th>Doctor</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>#APT001</td>
                                            <td>John Doe</td>
                                            <td>Dr. Smith</td>
                                            <td>2025-11-29</td>
                                            <td>10:00 AM</td>
                                            <td><span className="badge badge-primary">Scheduled</span></td>
                                            <td><button className="btn btn-secondary btn-sm" onClick={() => viewAppointment({ id: '#APT001', patient: 'John Doe', doctor: 'Dr. Smith', date: '2025-11-29', time: '10:00 AM', status: 'Scheduled', reason: 'Regular checkup', symptoms: 'Mild fever, headache', notes: 'Patient requested morning slot' })}>View</button></td>
                                        </tr>
                                        <tr>
                                            <td>#APT002</td>
                                            <td>Jane Smith</td>
                                            <td>Dr. Williams</td>
                                            <td>2025-11-29</td>
                                            <td>11:30 AM</td>
                                            <td><span className="badge badge-warning">In Progress</span></td>
                                            <td><button className="btn btn-secondary btn-sm" onClick={() => viewAppointment({ id: '#APT002', patient: 'Jane Smith', doctor: 'Dr. Williams', date: '2025-11-29', time: '11:30 AM', status: 'In Progress', reason: 'Follow-up consultation', symptoms: 'Back pain, joint stiffness', notes: 'Previous treatment review needed' })}>View</button></td>
                                        </tr>
                                        <tr>
                                            <td>#APT003</td>
                                            <td>Robert Johnson</td>
                                            <td>Dr. Brown</td>
                                            <td>2025-11-28</td>
                                            <td>2:00 PM</td>
                                            <td><span className="badge badge-success">Completed</span></td>
                                            <td><button className="btn btn-secondary btn-sm" onClick={() => viewAppointment({ id: '#APT003', patient: 'Robert Johnson', doctor: 'Dr. Brown', date: '2025-11-28', time: '2:00 PM', status: 'Completed', reason: 'Annual physical examination', symptoms: 'None', notes: 'Prescription provided, follow up in 6 months' })}>View</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Transaction History</h1>
                            <select className="form-select" style={{ width: 'auto' }}>
                                <option>All Transactions</option>
                                <option>Consultations</option>
                                <option>Medicines</option>
                                <option>Lab Tests</option>
                            </select>
                        </div>

                        <div className="transactions-section">
                            <div className="transactions-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>User</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Payment Method</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>#TXN001</td>
                                            <td>John Doe</td>
                                            <td>Consultation</td>
                                            <td>₹1,500</td>
                                            <td>Razorpay</td>
                                            <td><span className="badge badge-success">Success</span></td>
                                            <td>2025-11-28</td>
                                        </tr>
                                        <tr>
                                            <td>#TXN002</td>
                                            <td>Jane Smith</td>
                                            <td>Medicine</td>
                                            <td>₹2,480</td>
                                            <td>Stripe</td>
                                            <td><span className="badge badge-success">Success</span></td>
                                            <td>2025-11-28</td>
                                        </tr>
                                        <tr>
                                            <td>#TXN003</td>
                                            <td>Robert Johnson</td>
                                            <td>Lab Test</td>
                                            <td>₹890</td>
                                            <td>COD</td>
                                            <td><span className="badge badge-warning">Pending</span></td>
                                            <td>2025-11-27</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Reports & Analytics</h1>
                            <button className="btn btn-primary">Generate Report</button>
                        </div>

                        <div className="reports-section">
                            <div className="reports-grid">
                                <div className="report-card">
                                    <div className="report-icon">📊</div>
                                    <h3>Monthly Report</h3>
                                    <p>Comprehensive monthly analytics</p>
                                    <button className="btn btn-secondary" onClick={() => handleDownload('monthly', 'Monthly_Report')}>Download PDF</button>
                                </div>
                                <div className="report-card">
                                    <div className="report-icon">💰</div>
                                    <h3>Revenue Report</h3>
                                    <p>Detailed revenue breakdown</p>
                                    <button className="btn btn-secondary" onClick={() => handleDownload('revenue', 'Revenue_Report')}>Download PDF</button>
                                </div>
                                <div className="report-card">
                                    <div className="report-icon">👥</div>
                                    <h3>User Growth Report</h3>
                                    <p>User acquisition metrics</p>
                                    <button className="btn btn-secondary" onClick={() => handleDownload('user-growth', 'User_Growth_Report')}>Download PDF</button>
                                </div>
                                <div className="report-card">
                                    <div className="report-icon">📈</div>
                                    <h3>Performance Report</h3>
                                    <p>Platform performance metrics</p>
                                    <button className="btn btn-secondary" onClick={() => handleDownload('performance', 'Performance_Report')}>Download PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View User Modal */}
            {
                showViewModal && selectedUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>User Details</h2>
                                <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="user-details">
                                    <p><strong>Name:</strong> {selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                    <p><strong>Role:</strong> {selectedUser.role || 'Doctor'}</p>
                                    {selectedUser.specialization && <p><strong>Specialization:</strong> {selectedUser.specialization}</p>}
                                    {selectedUser.consultationFee && <p><strong>Consultation Fee:</strong> ₹{selectedUser.consultationFee}</p>}
                                    {selectedUser.experienceYears && <p><strong>Experience:</strong> {selectedUser.experienceYears} years</p>}
                                    {selectedUser.pharmacyName && <p><strong>Pharmacy Name:</strong> {selectedUser.pharmacyName}</p>}
                                    {selectedUser.licenseNumber && <p><strong>License Number:</strong> {selectedUser.licenseNumber}</p>}
                                    {selectedUser.employeeId && <p><strong>Employee ID:</strong> {selectedUser.employeeId}</p>}
                                    {selectedUser.yearsOfExperience && <p><strong>Years of Experience:</strong> {selectedUser.yearsOfExperience} years</p>}
                                    {selectedUser.status && <p><strong>Status:</strong> {selectedUser.status}</p>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                showEditModal && selectedUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Edit User</h2>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    updateUser(selectedUser);
                                }}>
                                    <div className="form-group">
                                        <label>Name:</label>
                                        <input
                                            type="text"
                                            value={selectedUser.name || selectedUser.firstName || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            value={selectedUser.email || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    {(selectedUser.role === 'doctor' || selectedUser.specialization || selectedUser.consultationFee) && (
                                        <>
                                            <div className="form-group">
                                                <label>Specialization:</label>
                                                <input
                                                    type="text"
                                                    value={selectedUser.specialization || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, specialization: e.target.value })}
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Consultation Fee (₹):</label>
                                                <input
                                                    type="number"
                                                    value={selectedUser.consultationFee || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, consultationFee: Number(e.target.value) })}
                                                    className="form-control"
                                                    min="0"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {(selectedUser.role === 'pharmacist' || selectedUser.pharmacyName || selectedUser.licenseNumber) && (
                                        <>
                                            <div className="form-group">
                                                <label>Pharmacy Name:</label>
                                                <input
                                                    type="text"
                                                    value={selectedUser.pharmacyName || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, pharmacyName: e.target.value })}
                                                    className="form-control"
                                                    placeholder="Enter pharmacy name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>License Number:</label>
                                                <input
                                                    type="text"
                                                    value={selectedUser.licenseNumber || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, licenseNumber: e.target.value })}
                                                    className="form-control"
                                                    placeholder="Enter license number"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Employee ID:</label>
                                                <input
                                                    type="text"
                                                    value={selectedUser.employeeId || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, employeeId: e.target.value })}
                                                    className="form-control"
                                                    placeholder="Enter employee ID"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Years of Experience:</label>
                                                <input
                                                    type="number"
                                                    value={selectedUser.yearsOfExperience || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, yearsOfExperience: Number(e.target.value) })}
                                                    className="form-control"
                                                    placeholder="Enter years of experience"
                                                    min="0"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="form-group">
                                        <label>Status:</label>
                                        <select
                                            value={selectedUser.status || 'active'}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                            className="form-control"
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && userToDeactivate && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Confirm Deactivation</h2>
                                <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                    Are you sure you want to deactivate <strong>{userToDeactivate.name || userToDeactivate.email}</strong>?
                                </p>
                                <div className="form-group">
                                    <label>Reason for deactivation: *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Please provide a reason for deactivating this user..."
                                        value={deactivateReason}
                                        onChange={(e) => setDeactivateReason(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn btn-accent" onClick={confirmDeactivate}>Confirm Deactivate</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add User Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-wrapper">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Add New User</h2>
                                    <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={createUser}>
                                        <div className="form-group">
                                            <label>Role: *</label>
                                            <select
                                                value={newUser.role || 'patient'}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                className="form-control"
                                                required
                                            >
                                                <option value="patient">Patient</option>
                                                <option value="doctor">Doctor</option>
                                                <option value="pharmacist">Pharmacist</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Name: *</label>
                                            <input
                                                type="text"
                                                value={newUser.name || ''}
                                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                className="form-control"
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email: *</label>
                                            <input
                                                type="email"
                                                value={newUser.email || ''}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="form-control"
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Password: *</label>
                                            <input
                                                type="password"
                                                value={newUser.password || ''}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="form-control"
                                                placeholder="Enter password"
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                        {newUser.role === 'doctor' && (
                                            <>
                                                <div className="form-group">
                                                    <label>Specialization: *</label>
                                                    <input
                                                        type="text"
                                                        value={newUser.specialization || ''}
                                                        onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                                                        className="form-control"
                                                        placeholder="e.g., Cardiology, Neurology"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Consultation Fee (₹): *</label>
                                                    <input
                                                        type="number"
                                                        value={newUser.consultationFee || ''}
                                                        onChange={(e) => setNewUser({ ...newUser, consultationFee: Number(e.target.value) })}
                                                        className="form-control"
                                                        placeholder="Enter consultation fee"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {newUser.role === 'pharmacist' && (
                                            <>
                                                <div className="form-group">
                                                    <label>Pharmacy Name:</label>
                                                    <input
                                                        type="text"
                                                        value={newUser.pharmacyName || ''}
                                                        onChange={(e) => setNewUser({ ...newUser, pharmacyName: e.target.value })}
                                                        className="form-control"
                                                        placeholder="Enter pharmacy name"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>License Number:</label>
                                                    <input
                                                        type="text"
                                                        value={newUser.licenseNumber || ''}
                                                        onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })}
                                                        className="form-control"
                                                        placeholder="Enter license number"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Employee ID:</label>
                                                    <input
                                                        type="text"
                                                        value={newUser.employeeId || ''}
                                                        onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                                                        className="form-control"
                                                        placeholder="Enter employee ID"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Years of Experience:</label>
                                                    <input
                                                        type="number"
                                                        value={newUser.yearsOfExperience || ''}
                                                        onChange={(e) => setNewUser({ ...newUser, yearsOfExperience: Number(e.target.value) })}
                                                        className="form-control"
                                                        placeholder="Enter years of experience"
                                                        min="0"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary">Create User</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Appointment Details Modal */}
            {
                showAppointmentModal && selectedAppointment && (
                    <div className="modal-overlay" onClick={() => {
                        setShowAppointmentModal(false);
                        setSelectedAppointment(null);
                    }}>
                        <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Appointment Details</h2>
                                <button className="close-btn" onClick={() => {
                                    setShowAppointmentModal(false);
                                    setSelectedAppointment(null);
                                }}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="appointment-detail-grid">
                                    <div className="detail-card">
                                        <div className="detail-label">
                                            <span className="detail-icon">🆔</span>
                                            Appointment ID
                                        </div>
                                        <div className="detail-value">{selectedAppointment.id || 'N/A'}</div>
                                    </div>

                                    <div className="detail-card">
                                        <div className="detail-label">
                                            <span className="detail-icon">👤</span>
                                            Patient Name
                                        </div>
                                        <div className="detail-value">{selectedAppointment.patient || 'N/A'}</div>
                                    </div>

                                    <div className="detail-card">
                                        <div className="detail-label">
                                            <span className="detail-icon">👨‍⚕️</span>
                                            Doctor Name
                                        </div>
                                        <div className="detail-value">{selectedAppointment.doctor || 'N/A'}</div>
                                    </div>

                                    <div className="detail-card">
                                        <div className="detail-label">
                                            <span className="detail-icon">📅</span>
                                            Date
                                        </div>
                                        <div className="detail-value">{selectedAppointment.date || 'N/A'}</div>
                                    </div>

                                    <div className="detail-card">
                                        <div className="detail-label">
                                            <span className="detail-icon">🕐</span>
                                            Time
                                        </div>
                                        <div className="detail-value">{selectedAppointment.time || 'N/A'}</div>
                                    </div>

                                    <div className="detail-card">
                                        <div className="detail-label">
                                            <span className="detail-icon">📋</span>
                                            Status
                                        </div>
                                        <div className="detail-value">
                                            <span className={`badge badge-${selectedAppointment.status === 'Scheduled' ? 'primary' :
                                                    selectedAppointment.status === 'In Progress' ? 'warning' :
                                                        selectedAppointment.status === 'Completed' ? 'success' :
                                                            'secondary'
                                                }`}>
                                                {selectedAppointment.status || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedAppointment.reason && (
                                    <div className="detail-card full-width">
                                        <div className="detail-label">
                                            <span className="detail-icon">💬</span>
                                            Reason for Visit
                                        </div>
                                        <div className="detail-value">{selectedAppointment.reason}</div>
                                    </div>
                                )}

                                {selectedAppointment.symptoms && (
                                    <div className="detail-card full-width">
                                        <div className="detail-label">
                                            <span className="detail-icon">🩺</span>
                                            Symptoms
                                        </div>
                                        <div className="detail-value">{selectedAppointment.symptoms}</div>
                                    </div>
                                )}

                                {selectedAppointment.notes && (
                                    <div className="detail-card full-width">
                                        <div className="detail-label">
                                            <span className="detail-icon">📝</span>
                                            Additional Notes
                                        </div>
                                        <div className="detail-value">{selectedAppointment.notes}</div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => {
                                    setShowAppointmentModal(false);
                                    setSelectedAppointment(null);
                                }}>Close</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    );
};

export default AdminDashboard;
