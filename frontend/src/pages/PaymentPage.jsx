import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { showSuccessToast } from '../utils/toast';
import './Auth.css';

const PaymentPage = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [processing, setProcessing] = useState(false);

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

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            // In a real app, you would integrate with a payment gateway like Razorpay
            // For now, we'll simulate a successful payment
            const paymentData = {
                paymentMethod: paymentMethod,
                transactionId: 'txn_' + Date.now()
            };

            const response = await axios.post(`/api/prescription-orders/${orderId}/pay`, paymentData);

            if (response.data.order) {
                showSuccessToast('Payment successful!');
                navigate(`/view-order/${orderId}`);
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            setError(err.response?.data?.message || 'Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="auth-container"><div className="loading">Loading payment details...</div></div>;
    }

    if (error) {
        return <div className="auth-container"><div className="error-message">{error}</div></div>;
    }

    if (!order) {
        return <div className="auth-container"><div className="error-message">Order not found</div></div>;
    }

    // Check if order is in the correct status for payment
    if (order.status !== 'Approved - Awaiting Payment') {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <h2>Payment Not Available</h2>
                    <p className="error-message">
                        This order is not ready for payment. Current status: {order.status}
                    </p>
                    <button
                        className="btn btn-secondary btn-block"
                        onClick={() => navigate(`/view-order/${orderId}`)}
                    >
                        Back to Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Payment for Order #{order.orderId}</h2>

                <div className="payment-details">
                    <div className="detail-row">
                        <span className="label">Patient:</span>
                        <span className="value">{user?.name}</span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Order Total:</span>
                        <span className="value">₹{order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="order-items">
                        <h3>Order Items</h3>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Qty</th>
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
                    </div>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="form-group">
                        <label>Select Payment Method</label>
                        <div className="payment-options">
                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="razorpay"
                                    name="paymentMethod"
                                    value="razorpay"
                                    checked={paymentMethod === 'razorpay'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <label htmlFor="razorpay">
                                    <span className="payment-icon">💳</span>
                                    <span>Razorpay</span>
                                </label>
                            </div>

                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="stripe"
                                    name="paymentMethod"
                                    value="stripe"
                                    checked={paymentMethod === 'stripe'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <label htmlFor="stripe">
                                    <span className="payment-icon">💳</span>
                                    <span>Stripe</span>
                                </label>
                            </div>

                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="cod"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <label htmlFor="cod">
                                    <span className="payment-icon">💵</span>
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={processing}
                    >
                        {processing ? 'Processing Payment...' : `Pay ₹${order.totalAmount.toFixed(2)}`}
                    </button>
                </form>

                <button
                    className="btn btn-secondary btn-block"
                    onClick={() => navigate(`/view-order/${orderId}`)}
                >
                    Cancel Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;