import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';
import DoctorPatientsPage from '../components/DoctorPatientsPage';
import DoctorSchedulePage from '../components/DoctorSchedulePage';
import DoctorAppointmentsPage from '../components/DoctorAppointmentsPage';
import DoctorAccount from './DoctorAccount';
import Sidebar from '../components/Sidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(tabFromUrl);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stats, setStats] = useState({
        totalPatients: 0,
        pendingReports: 0,
        upcomingAppointments: 0
    });
    const [loading, setLoading] = useState(true);

    // Sync activeTab with URL params
    useEffect(() => {
        const urlTab = searchParams.get('tab') || 'overview';
        setActiveTab(urlTab);
    }, [searchParams]);

    // Authentication check and data fetching - only on mount
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login/doctor');
            return;
        }

        fetchDashboardData();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]); // Removed 'navigate' from dependencies to prevent redirect loops

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [notifRes, countRes, statsRes] = await Promise.all([
                axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/notifications/unread-count', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/doctors/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setNotifications(notifRes.data.slice(0, 5)); // Show only 5 most recent
            setUnreadCount(countRes.data.count);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to defaults or keep loading false
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const [notifRes, countRes] = await Promise.all([
                axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/notifications/unread-count', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setNotifications(notifRes.data.slice(0, 5)); // Show only 5 most recent
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedData = {
            name: formData.get('name'), // Assuming name input has name="name"
            specialization: formData.get('specialization'), // Assuming input has name="specialization"
            consultationFee: formData.get('consultationFee'), // Assuming input has name="consultationFee"
            symptoms: formData.get('symptoms').split(',').map(s => s.trim()).filter(s => s)
        };

        try {
            await axios.put(`/api/doctors/${user.userId}`, updatedData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showSuccessToast('Profile updated successfully');
            // Optionally refresh user data here
        } catch (error) {
            console.error('Error updating profile:', error);
            showErrorToast('Failed to update profile');
        }
    };

    const handleUpdateSchedule = async () => {
        // Implement schedule update logic
        showInfoToast('Schedule update functionality would go here');
    };



    return (
        <div className="doctor-dashboard">
            <Sidebar
                role="doctor"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />

            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-header-left">
                        <h2>Dashboard</h2>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Dashboard Overview</h1>
                            <p>Welcome back, Dr. {user?.name || 'Smith'}</p>
                        </div>

                        <div className="stats-grid">

                            <div className="stat-card">
                                <div className="stat-icon green">👥</div>
                                <div className="stat-info">
                                    <h3>{stats.totalPatients}</h3>
                                    <p>Total Appointments</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">📋</div>
                                <div className="stat-info">
                                    <h3>{stats.pendingReports}</h3>
                                    <p>Pending Reports</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">🔔</div>
                                <div className="stat-info">
                                    <h3>{unreadCount}</h3>
                                    <p>New Notifications</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">


                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h2>Notifications</h2>
                                    <button className="btn-link" onClick={handleMarkAllRead}>Mark all read</button>
                                </div>
                                <div className="notifications-list">
                                    {notifications.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No notifications</p>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                                                <div className="notification-content">
                                                    <p>{notif.message}</p>
                                                    <span className="notification-time">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {!notif.isRead && <div className="unread-dot"></div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && <DoctorAppointmentsPage />}

                {activeTab === 'patients' && <DoctorPatientsPage />}

                {activeTab === 'schedule' && <DoctorSchedulePage />}

                {activeTab === 'profile' && <DoctorAccount />}
            </div>
        </div>
    );
};

export default DoctorDashboard;
