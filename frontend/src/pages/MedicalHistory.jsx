import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MedicalHistory.css';

const MedicalHistory = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            // FIX: Use correctly scoped endpoint for patient orders
            const response = await axios.get('/api/prescription-orders/patient/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const renderOrders = () => {
        if (loading) {
            return <div className="loading-state">Loading orders...</div>;
        }

        if (orders.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">
                        📦
                    </div>
                    <h3 className="empty-title">No Orders Yet</h3>
                    <p className="empty-subtitle">You haven't placed any prescription orders yet.</p>
                    <button
                        className="start-ordering-btn"
                        onClick={() => navigate('/doctors')}
                    >
                        Find a Doctor
                    </button>
                </div>
            );
        }

        return (
            <div className="records-list">
                {orders.map((order) => (
                    <div key={order._id} className="record-card">
                        <div className="record-header">
                            <h4>Order #{order.orderId}</h4>
                            <span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="record-details">
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            {order.totalAmount && (
                                <p><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                            )}
                        </div>
                        {order.medicines && order.medicines.length > 0 && (
                            <div className="medicines-list">
                                <strong>Medicines:</strong>
                                <ul>
                                    {order.medicines.map((item, idx) => (
                                        <li key={idx}>{item.name || item.medicineId?.name} - Qty: {item.quantity}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="medical-history-container">
            <div className="medical-history-header">
                <h2>My Orders</h2>
                <button className="btn-secondary" onClick={() => navigate('/profile')}>
                    View Health Profile
                </button>
            </div>

            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Prescription Orders
                </button>
            </div>

            <div className="tab-content">
                {renderOrders()}
            </div>
        </div>
    );
};

export default MedicalHistory;
