import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import './PharmacistDashboard.css';

const UpdateOrderStatus = () => {
    const { user, isAuthenticated, ensureAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('UpdateOrderStatus useEffect triggered', { isAuthenticated, user });
        if (isAuthenticated && user?.role === 'pharmacist') {
            console.log('Fetching all orders for pharmacist');
            fetchAllOrders();
        }
    }, [isAuthenticated, user]);

    const fetchAllOrders = async () => {
        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            console.log('Making API call to /api/prescription-orders/all');
            const response = await axios.get('/api/prescription-orders/all');
            console.log('API response:', response.data);
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            console.error('Error response:', err.response?.data);

            // Display detailed error message
            let errorMessage = 'Failed to fetch orders';
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.receivedRole && errorData.requiredRoles) {
                    errorMessage = `${errorData.message}\nYour role: ${errorData.receivedRole}\nRequired roles: ${errorData.requiredRoles.join(', ')}`;
                } else {
                    errorMessage = errorData.message || errorMessage;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleStartProcessing = async (orderId) => {
        if (!window.confirm('Are you sure you want to start processing this order?')) {
            return;
        }

        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            const response = await axios.patch(`/api/prescription-orders/${orderId}/start-processing`);

            if (response.data.order) {
                showSuccessToast('Order status updated to Processing');
                fetchAllOrders(); // Refresh the list
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            showErrorToast(err.response?.data?.message || 'Failed to update order status');
        }
    };

    const handleMarkReadyForDispatch = async (orderId) => {
        if (!window.confirm('Are you sure you want to mark this order as Ready for Dispatch?')) {
            return;
        }

        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            const response = await axios.patch(`/api/prescription-orders/${orderId}/ready-for-dispatch`);

            if (response.data.order) {
                showSuccessToast('Order marked as Ready for Dispatch and delivery package created');
                fetchAllOrders(); // Refresh the list
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            showErrorToast(err.response?.data?.message || 'Failed to update order status');
        }
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Update Order Status</h2>
                </div>
                <div className="error-message" style={{ whiteSpace: 'pre-line' }}>{error}</div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'pharmacist') {
        return (
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Update Order Status</h2>
                </div>
                <div className="error-message">Access denied. Please log in as a pharmacist.</div>
            </div>
        );
    }

    // Filter orders by status
    const paidOrders = orders.filter(order => order.status === 'Paid');
    const processingOrders = orders.filter(order => order.status === 'Processing');
    const readyForDispatchOrders = orders.filter(order => order.status === 'Ready for Dispatch');

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <h2>Update Order Status</h2>
                <p>Manage order processing and dispatch</p>
            </div>

            {/* Paid Orders - Ready to Process */}
            <div className="orders-section">
                <h3>Paid Orders (Ready to Process)</h3>
                {paidOrders.length === 0 ? (
                    <div className="empty-state">
                        <p>No paid orders awaiting processing</p>
                    </div>
                ) : (
                    <div className="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Patient</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paidOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>#{order.orderId}</td>
                                        <td>{order.patientName}</td>
                                        <td>{order.orderItems.length}</td>
                                        <td>₹{order.totalAmount.toFixed(2)}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleStartProcessing(order._id)}
                                            >
                                                Start Processing
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Processing Orders */}
            <div className="orders-section">
                <h3>Processing Orders</h3>
                {processingOrders.length === 0 ? (
                    <div className="empty-state">
                        <p>No orders currently being processed</p>
                    </div>
                ) : (
                    <div className="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Patient</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processingOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>#{order.orderId}</td>
                                        <td>{order.patientName}</td>
                                        <td>{order.orderItems.length}</td>
                                        <td>₹{order.totalAmount.toFixed(2)}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-accent btn-sm"
                                                onClick={() => handleMarkReadyForDispatch(order._id)}
                                            >
                                                Ready for Dispatch
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Ready for Dispatch Orders */}
            <div className="orders-section">
                <h3>Ready for Dispatch</h3>
                {readyForDispatchOrders.length === 0 ? (
                    <div className="empty-state">
                        <p>No orders ready for dispatch</p>
                    </div>
                ) : (
                    <div className="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Patient</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readyForDispatchOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>#{order.orderId}</td>
                                        <td>{order.patientName}</td>
                                        <td>{order.orderItems.length}</td>
                                        <td>₹{order.totalAmount.toFixed(2)}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className="badge badge-accent">Ready for Dispatch</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateOrderStatus;