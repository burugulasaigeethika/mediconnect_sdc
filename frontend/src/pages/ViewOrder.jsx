import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import './Auth.css';

const ViewOrder = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`/api/prescription-orders/${orderId}`);
            setOrder(response.data);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(err.response?.data?.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            // In a real app, you would integrate with a payment gateway like Razorpay
            // For now, we'll simulate a successful payment
            const paymentData = {
                paymentMethod: 'razorpay',
                transactionId: 'txn_' + Date.now()
            };

            const response = await axios.post(`/api/prescription-orders/${orderId}/pay`, paymentData);

            if (response.data.order) {
                setOrder(response.data.order);
                showSuccessToast('Payment successful!');
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            showErrorToast(err.response?.data?.message || 'Failed to process payment');
        }
    };

    if (loading) {
        return (
            <div className="auth-container">
                <div className="loading">Loading order details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-form" style={{ textAlign: 'center' }}>
                    <div className="error-message">{error}</div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/dashboard')}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="auth-container">
                <div className="auth-form" style={{ textAlign: 'center' }}>
                    <div className="error-message">Order not found</div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/dashboard')}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Order Details</h2>
                <p>Order ID: {order.orderId}</p>

                <div className="order-details">
                    <div className="detail-row">
                        <span className="label">Status:</span>
                        <span className="value">
                            <span className={`badge badge-${order.status === 'Pending Review' ? 'warning' :
                                order.status === 'Approved - Awaiting Payment' ? 'info' :
                                    order.status === 'Paid' ? 'success' :
                                        order.status === 'Processing' ? 'primary' :
                                            order.status === 'Ready for Dispatch' ? 'accent' :
                                                order.status === 'Completed' ? 'success' : 'danger'}`}>
                                {order.status}
                            </span>
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Prescription:</span>
                        <span className="value">{order.prescriptionFile}</span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Created:</span>
                        <span className="value">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    {order.verifiedBy && (
                        <div className="detail-row">
                            <span className="label">Verified By:</span>
                            <span className="value">{order.verifiedBy.name}</span>
                        </div>
                    )}

                    {order.notes && (
                        <div className="detail-row">
                            <span className="label">Notes:</span>
                            <span className="value">{order.notes}</span>
                        </div>
                    )}

                    {order.orderItems && order.orderItems.length > 0 && (
                        <div className="order-items">
                            <h3>Medicines</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.price.toFixed(2)}</td>
                                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="total-amount">
                                <strong>Total Amount: ₹{order.totalAmount.toFixed(2)}</strong>
                            </div>
                        </div>
                    )}

                    {order.status === 'Approved - Awaiting Payment' && (
                        <div className="payment-section">
                            <h3>Payment Required</h3>
                            <p>Please complete the payment to proceed with your order.</p>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={handlePayment}
                            >
                                Pay Now (₹{order.totalAmount.toFixed(2)})
                            </button>
                        </div>
                    )}

                    {order.status === 'Paid' && (
                        <div className="payment-confirmation">
                            <h3>Payment Successful</h3>
                            <p>Your payment has been processed successfully. Your order is now being prepared.</p>
                        </div>
                    )}

                    {order.status === 'Processing' && (
                        <div className="processing-info">
                            <h3>Order Processing</h3>
                            <p>Your order is currently being prepared by our pharmacist team.</p>
                        </div>
                    )}

                    {order.status === 'Ready for Dispatch' && (
                        <div className="dispatch-info">
                            <h3>Ready for Dispatch</h3>
                            <p>Your order is ready and will be dispatched soon.</p>
                        </div>
                    )}
                </div>

                <button
                    className="btn btn-secondary btn-block"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ViewOrder;