import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [prescriptionUrl, setPrescriptionUrl] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    const updateQuantity = (medicineId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(medicineId);
            return;
        }

        const newCart = cart.map(item =>
            item.medicine._id === medicineId
                ? { ...item, quantity: newQuantity }
                : item
        );
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeFromCart = (medicineId) => {
        const newCart = cart.filter(item => item.medicine._id !== medicineId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0).toFixed(2);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            setMessage({ type: 'error', text: 'Your cart is empty' });
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order in Database
            const orderData = {
                items: cart.map(item => ({
                    medicine: item.medicine._id,
                    quantity: item.quantity
                })),
                deliveryAddress,
                prescriptionUrl
            };

            const orderResponse = await axios.post('/api/pharmacy/orders', orderData);
            const { order } = orderResponse.data;

            // 2. Create Razorpay Order
            const paymentResponse = await axios.post('/api/pharmacy/create-payment-order', {
                amount: order.totalAmount // Amount from the created order
            });
            const { order: razorpayOrder } = paymentResponse.data;

            // 3. Initialize Razorpay
            const options = {
                key: "rzp_test_YOUR_KEY_HERE", // Replace with your Test Key ID
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "MediConnect",
                description: "Pharmacy Order Payment",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        const verifyResponse = await axios.post('/api/pharmacy/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id
                        });

                        if (verifyResponse.data.success) {
                            localStorage.removeItem('cart');
                            setCart([]);
                            setMessage({ type: 'success', text: 'Payment successful! Order placed.' });
                            setTimeout(() => navigate('/dashboard'), 2000);
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        setMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
                    }
                },
                prefill: {
                    name: "MediConnect User",
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3498db"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setMessage({ type: 'error', text: response.error.description });
            });
            rzp1.open();

        } catch (error) {
            console.error('Order placement error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to place order'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cart-page">
            <div className="container">
                <div className="page-header">
                    <h1>Shopping Cart</h1>
                    <p>Review your items and complete your order</p>
                </div>

                {cart.length > 0 ? (
                    <div className="cart-grid">
                        <div className="cart-items">
                            <h2>Cart Items ({cart.length})</h2>

                            {cart.map((item) => (
                                <div key={item.medicine._id} className="cart-item">
                                    <div className="item-info">
                                        <h3>{item.medicine.name}</h3>
                                        <p className="item-generic">{item.medicine.genericName}</p>
                                        <p className="item-price">${item.medicine.price} per unit</p>
                                    </div>

                                    <div className="item-controls">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)}
                                                className="qty-btn"
                                            >
                                                −
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)}
                                                className="qty-btn"
                                                disabled={item.quantity >= item.medicine.stock}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="item-total">
                                            ${(item.medicine.price * item.quantity).toFixed(2)}
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.medicine._id)}
                                            className="btn btn-secondary remove-btn"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-section">
                            <h2>Checkout</h2>

                            {message.text && (
                                <div className={`alert alert-${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handlePlaceOrder} className="checkout-form">
                                <h3>Delivery Address</h3>

                                <div className="form-group">
                                    <label htmlFor="street" className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        id="street"
                                        className="form-input"
                                        value={deliveryAddress.street}
                                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city" className="form-label">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            className="form-input"
                                            value={deliveryAddress.city}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="state" className="form-label">State</label>
                                        <input
                                            type="text"
                                            id="state"
                                            className="form-input"
                                            value={deliveryAddress.state}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        className="form-input"
                                        value={deliveryAddress.zipCode}
                                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="prescription" className="form-label">Prescription URL (if required)</label>
                                    <input
                                        type="url"
                                        id="prescription"
                                        className="form-input"
                                        value={prescriptionUrl}
                                        onChange={(e) => setPrescriptionUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="order-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>${getTotalAmount()}</span>
                                    </div>
                                    <div className="summary-row summary-total">
                                        <span>Total:</span>
                                        <span>${getTotalAmount()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={loading}
                                >
                                    {loading ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some medicines to get started</p>
                        <button onClick={() => navigate('/pharmacy')} className="btn btn-primary">
                            Browse Pharmacy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
