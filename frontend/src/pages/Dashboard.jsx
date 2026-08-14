import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { showErrorToast } from '../utils/toast';
import Sidebar from '../components/Sidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import Doctors from './Doctors';
import Pharmacy from './Pharmacy';
import Appointments from './Appointments';
import UploadPrescription from './UploadPrescription';
import MedicalHistory from './MedicalHistory';
import PatientAccount from './PatientAccount';
import MyAddresses from './MyAddresses';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        appointments: 0,
        prescriptions: 0,
        orders: 0
    });

    // Check URL parameters and set active tab
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);
    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Fetch user stats
        const fetchStats = async () => {
            try {
                if (user?.id) {
                    const [presRes, apptRes, ordersRes] = await Promise.all([
                        axios.get(`/api/patients/prescriptions/${user.id}`).catch(() => ({ data: [] })),
                        axios.get('/api/appointments/my').catch(() => ({ data: [] })),
                        axios.get('/api/prescription-orders/patient/my-orders').catch(() => ({ data: [] }))
                    ]);

                    // Calculate stats
                    const upcomingAppointments = Array.isArray(apptRes.data)
                        ? apptRes.data.filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'Cancelled').length
                        : 0;

                    const pendingOrders = Array.isArray(ordersRes.data)
                        ? ordersRes.data.filter(o => ['Pending', 'Processing'].includes(o.status)).length
                        : 0;

                    setStats({
                        appointments: upcomingAppointments,
                        prescriptions: presRes.data.length || 0,
                        orders: pendingOrders
                    });
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [isAuthenticated, navigate, user]);

    useEffect(() => {
        if (activeTab === 'orders' && isAuthenticated) {
            fetchOrders();
        }
    }, [activeTab, isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const response = await axios.get('/api/prescription-orders/patient/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };


    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Use the main doctors API endpoint with search query
            const response = await axios.get(`/api/doctors?search=${searchQuery}`);
            setDoctors(response.data);
            // Scroll to results
            document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error searching doctors:', error);
            showErrorToast('Failed to search doctors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="dashboard-content">
                        <section className="hero">
                            <div className="container">
                                <div className="hero-search-section">
                                    <h1 className="hero-title">Welcome back, {user?.name || 'Patient'}</h1>
                                    <p className="hero-subtitle">
                                        Manage your health, book appointments, and order medicines
                                    </p>

                                    <div className="dashboard-stats">
                                        <div className="stat-card">
                                            <h3>{stats.appointments}</h3>
                                            <p>Upcoming Appointments</p>
                                        </div>
                                        <div className="stat-card">
                                            <h3>{stats.prescriptions}</h3>
                                            <p>Active Prescriptions</p>
                                        </div>
                                        <div className="stat-card">
                                            <h3>{stats.orders}</h3>
                                            <p>Pending Orders</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSearch} className="search-container">
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search for doctors, specialties, or services"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button type="submit" className="search-btn" disabled={loading}>
                                            {loading ? 'Searching...' : 'Search'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        {/* Search Results */}
                        {doctors.length > 0 && (
                            <section id="search-results" className="section">
                                <div className="container">
                                    <h2 className="section-title">Search Results</h2>
                                    <div className="doctors-grid">
                                        {doctors.map(doctor => (
                                            <div key={doctor._id} className="doctor-card">
                                                <div className="doctor-info">
                                                    <h3>Dr. {doctor.name}</h3>
                                                    <p className="specialty">{doctor.specialization}</p>
                                                    <p className="experience">{doctor.experience} years experience</p>
                                                    <Link to={`/doctors/${doctor._id}`} className="btn btn-sm">View Profile</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Services Section */}
                        <section className="section services">
                            <div className="container">
                                <h2 className="section-title text-center">Quick Actions</h2>

                                <div className="services-grid">
                                    <Link to="/pharmacy" className="service-card">
                                        <div className="service-icon green">💊</div>
                                        <h3>Order Medicines</h3>
                                        <p>Upload prescription or browse medicines</p>
                                        <span className="explore-link">Go to Pharmacy →</span>
                                    </Link>

                                    <Link to="/appointments" className="service-card">
                                        <div className="service-icon blue">📅</div>
                                        <h3>Book Appointment</h3>
                                        <p>Find doctors and schedule visits</p>
                                        <span className="explore-link">Find Doctors →</span>
                                    </Link>

                                    <Link to="/upload-prescription" className="service-card">
                                        <div className="service-icon purple">📄</div>
                                        <h3>Upload Prescription</h3>
                                        <p>Submit a new prescription for review</p>
                                        <span className="explore-link">Upload Now →</span>
                                    </Link>

                                    <div className="service-card service-card-full">
                                        <div className="service-icon red">📋</div>
                                        <h3>Medical History</h3>
                                        <p>View your past records and reports</p>
                                        <span className="explore-link">View Records →</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'doctors':
                return <Doctors />;
            case 'pharmacy':
                return <Pharmacy />;
            case 'appointments':
                return <Appointments />;
            case 'upload-prescription':
                return <UploadPrescription />;
            case 'orders':
                return (
                    <div className="dashboard-content">
                        <h2>My Orders</h2>
                        {ordersLoading ? (
                            <div className="loading">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="empty-state">
                                <p>No orders found.</p>
                                <Link to="/pharmacy" className="btn btn-primary">Order Medicines</Link>
                            </div>
                        ) : (
                            <div className="orders-table-container">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.orderId}>
                                                <td>#{order.orderId}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>₹{(order.totalAmount || 0).toFixed(2)}</td>
                                                <td>
                                                    <Link to={`/view-order/${order.orderId}`} className="btn btn-sm btn-outline">
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'medical-history':
                return <MedicalHistory />;
            case 'profile':
                return <PatientAccount />;
            case 'addresses':
                return <MyAddresses />;
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <Sidebar
                role="patient"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />
            <div className="dashboard-main" style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
                <div style={{ padding: '30px' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;