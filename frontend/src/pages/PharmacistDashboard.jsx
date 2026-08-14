import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './PharmacistDashboard.css';
import RecentOrders from '../components/RecentOrders';
// Import the components directly
import PrescriptionReview from './PrescriptionReview.jsx';
import UpdateOrderStatus from './UpdateOrderStatus.jsx';
import AddMedicinesToOrder from './AddMedicinesToOrder.jsx';
import InventoryManagement from './InventoryManagement.jsx';
import PharmacistAccount from './PharmacistAccount.jsx';

const PharmacistDashboard = () => {
    const { isAuthenticated, user, logout, getRoleDashboard, ensureAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(tabFromUrl);
    const [loading, setLoading] = useState(true);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [totalMedicines, setTotalMedicines] = useState(0);
    const [lowStockAlerts, setLowStockAlerts] = useState(0);
    const [todaysRevenue, setTodaysRevenue] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Sync activeTab with URL params
    useEffect(() => {
        const urlTab = searchParams.get('tab') || 'overview';
        setActiveTab(urlTab);
    }, [searchParams]);

    useEffect(() => {
        console.log('PharmacistDashboard useEffect triggered', { isAuthenticated, user });

        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login/pharmacist');
            return;
        }

        // Check if user is a pharmacist
        if (user?.role !== 'pharmacist') {
            console.log('User is not a pharmacist, redirecting to appropriate dashboard');
            // Redirect to appropriate dashboard based on role
            const dashboardPath = getRoleDashboard(user?.role);
            navigate(dashboardPath);
            return;
        }

        console.log('Fetching dashboard stats for pharmacist');
        fetchDashboardStats();
    }, [isAuthenticated, user, navigate, getRoleDashboard]);

    const fetchDashboardStats = async () => {
        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            console.log('Making API calls to fetch dashboard stats');

            // Fetch pending prescriptions
            const pendingResponse = await axios.get('/api/prescription-orders/pending');
            setPendingOrdersCount(pendingResponse.data.length);

            // Fetch medicines inventory
            const medicinesResponse = await axios.get('/api/pharmacists/medicines');
            const medicines = medicinesResponse.data;
            setTotalMedicines(medicines.length);

            // Calculate low stock alerts (stock < 10)
            const lowStock = medicines.filter(med => med.stock < 10 && med.stock > 0).length;
            setLowStockAlerts(lowStock);

            // TODO: Fetch today's revenue from orders
            // For now, calculate from medicines if available
            // const revenueResponse = await axios.get('/api/pharmacists/revenue/today');
            // setTodaysRevenue(revenueResponse.data.total);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            console.error('Error response:', error.response?.data);
            setLoading(false);
        }
    };

    // Handle navigation to add medicines page
    useEffect(() => {
        if (activeTab.startsWith('add-medicines-')) {
            const orderId = activeTab.replace('add-medicines-', '');
            setSelectedOrderId(orderId);
        }
    }, [activeTab]);

    const handleOrderSelect = (order) => {
        // Navigate to the order details page
        setActiveTab(`order-${order.itemId}`);
    };

    return (
        <div className="pharmacist-dashboard">
            <Sidebar
                role="pharmacist"
                activeTab={activeTab.startsWith('add-medicines-') ? 'prescription-review' : activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />

            <div className="dashboard-main">
                <div className="dashboard-header">
                    <h2>Pharmacy Dashboard</h2>
                </div>

                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Dashboard Overview</h1>
                            <p>Welcome to your pharmacy portal, {user?.name}</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue">📋</div>
                                <div className="stat-info">
                                    <h3>{pendingOrdersCount}</h3>
                                    <p>Pending Prescriptions</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green">📦</div>
                                <div className="stat-info">
                                    <h3>{totalMedicines}</h3>
                                    <p>Total Medicines</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">⚠️</div>
                                <div className="stat-info">
                                    <h3>{lowStockAlerts}</h3>
                                    <p>Low Stock Alerts</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">💰</div>
                                <div className="stat-info">
                                    <h3>₹{todaysRevenue}</h3>
                                    <p>Today's Revenue</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h2>Quick Actions</h2>
                                </div>
                                <div className="quick-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setActiveTab('prescription-review')}
                                    >
                                        Review Prescriptions ({pendingOrdersCount})
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setActiveTab('update-status')}
                                    >
                                        Update Order Status
                                    </button>
                                    <button
                                        className="btn btn-accent"
                                        onClick={() => setActiveTab('inventory')}
                                    >
                                        Manage Inventory
                                    </button>
                                </div>
                            </div>

                            <div className="dashboard-card">
                                <RecentOrders onOrderSelect={handleOrderSelect} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prescription-review' && <PrescriptionReview setActiveTab={setActiveTab} />}

                {activeTab.startsWith('add-medicines-') && (
                    <AddMedicinesToOrder
                        orderId={selectedOrderId}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === 'update-status' && <UpdateOrderStatus />}

                {activeTab === 'inventory' && <InventoryManagement />}

                {activeTab === 'profile' && <PharmacistAccount />}
            </div>
        </div>
    );
};

export default PharmacistDashboard;