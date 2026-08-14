import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Toast from '../components/Toast';
import './PharmacistDashboard.css';

import ReviewPdfViewer from '../components/ReviewPdfViewer';
import { rejectPrescription } from '../services/pharmacistService';

const PrescriptionReview = ({ setActiveTab }) => {
    const { user, isAuthenticated, ensureAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // States for Cart & Medicine Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Toast State
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'pharmacist') {
            fetchPendingOrders();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (selectedOrder) {
            fetchCart(selectedOrder.orderId);
        }
    }, [selectedOrder]);

    const fetchPendingOrders = async () => {
        try {
            ensureAuthHeaders();
            const response = await axios.get('/api/prescription-orders/pending');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async (orderId) => {
        try {
            ensureAuthHeaders();
            const response = await axios.get(`/api/cart/${orderId}`);
            setCartItems(response.data.medicines || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    const searchMedicines = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            ensureAuthHeaders();
            const response = await axios.get(`/api/medicines/search?q=${query}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error('Error searching medicines:', err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        // Debounce can be added here, for now simple implementation
        if (query.length > 2) {
            searchMedicines(query);
        } else {
            setSearchResults([]);
        }
    };

    const handleAddToCart = async (medicine) => {
        if (!selectedOrder) return;

        try {
            setCartLoading(true);
            ensureAuthHeaders();

            // Calculate new quantity: Defaults to 1 if new, or increments existing
            let quantity = 1;
            const existingItem = cartItems.find(item => item.medicineId === medicine._id);
            if (existingItem) {
                quantity = existingItem.quantity + 1;
            }

            const payload = {
                orderId: selectedOrder.orderId,
                patientId: selectedOrder.patientId,
                medicines: [{
                    medicineId: medicine._id,
                    quantity: quantity
                }]
            };

            const response = await axios.post('/api/cart/add', payload);
            setCartItems(response.data.medicines);
            setSearchResults([]); // Clear search after adding
            setSearchQuery('');
            showToast(`Added ${medicine.name} to cart`, 'success');
        } catch (err) {
            console.error('Error adding to cart:', err);
            showToast('Failed to add medicine', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const updateQuantity = async (medicineId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            setCartLoading(true);
            ensureAuthHeaders();
            const payload = {
                orderId: selectedOrder.orderId,
                patientId: selectedOrder.patientId,
                medicines: [{
                    medicineId: medicineId,
                    quantity: newQuantity
                }]
            };
            const response = await axios.post('/api/cart/add', payload);
            setCartItems(response.data.medicines);
        } catch (err) {
            console.error('Error updating quantity:', err);
            showToast('Failed to update quantity', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const handleRemoveFromCart = async (medicineId) => {
        if (!window.confirm('Remove from cart?')) return;
        try {
            setCartLoading(true);
            ensureAuthHeaders();
            const response = await axios.delete(`/api/cart/remove/${selectedOrder.orderId}/${medicineId}`);
            setCartItems(response.data.medicines);
            showToast('Medicine removed from cart', 'info');
        } catch (err) {
            console.error('Error removing item:', err);
            showToast('Failed to remove item', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const handleApproveOrder = async () => {
        if (!selectedOrder) return;
        if (cartItems.length === 0) {
            showToast('Please add medicines before approving', 'error');
            return;
        }

        try {
            setCartLoading(true);
            ensureAuthHeaders();
            // Call API to approve order with medicines from cart
            const response = await axios.patch(`/api/prescription-orders/${selectedOrder.orderId}/approve`, {
                medicines: cartItems
            });

            if (response.data.order) {
                showToast('Order approved successfully', 'success');
                closeReviewModal();
                fetchPendingOrders(); // Refresh table
            }
        } catch (err) {
            console.error('Error approving order:', err);
            showToast(err.response?.data?.message || 'Failed to approve order', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const handleReviewClick = (order) => {
        setSelectedOrder(order);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedOrder(null);
        setCartItems([]);
    };

    // Add the missing handleReject function
    const handleReject = async (orderId) => {
        try {
            setCartLoading(true);

            // Call API to reject order using the service
            const response = await rejectPrescription(orderId, rejectionReason);

            if (response.order) {
                showToast('Order has been rejected and removed from the review list.', 'success');
                closeReviewModal();
                closeRejectModal();
                fetchPendingOrders(); // Refresh table to remove rejected order
            }
        } catch (err) {
            console.error('Error rejecting order:', err);
            showToast(err.message || 'Failed to reject order', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const openRejectModal = () => {
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setRejectionReason('');
    };

    const confirmRejection = () => {
        if (!rejectionReason.trim()) {
            showToast('Please provide a reason for rejection', 'warning');
            return;
        }
        handleReject(selectedOrder.orderId);
    };

    if (loading) return <div className="loading">Loading pending prescriptions...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-content">
            {toast && (
                <div className="toast-container">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            <div className="dashboard-header">
                <h2>Prescription Review</h2>
            </div>

            {!showReviewModal ? (
                // Table View
                <div className="prescriptions-table">
                    {orders.length === 0 ? <div className="empty-state">No Pending Prescriptions</div> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td>#{order.orderId}</td>
                                        <td>{order.patientName}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleReviewClick(order)}>
                                                Review & Process
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                // Detailed Review View
                <div className="review-container" style={{ display: 'flex', gap: '20px', height: '80vh' }}>

                    {/* Left Side: Prescription Viewer */}
                    <div className="review-left" style={{ flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3>Prescription for Order #{selectedOrder.orderId}</h3>
                            <button onClick={closeReviewModal} className="btn btn-secondary btn-sm">Close</button>
                        </div>
                        {/* Using memoized component to prevent re-renders when typing in search */}
                        <ReviewPdfViewer fileUrl={selectedOrder.prescriptionFile} />
                    </div>

                    {/* Right Side: Medicine Selection & Cart */}
                    <div className="review-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
                        <h3>Select Medicines</h3>

                        {/* Search Bar */}
                        <div className="medicine-search" style={{ marginBottom: '20px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search medicines..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {searchLoading && <small>Searching...</small>}
                            {searchResults.length > 0 && (
                                <ul className="search-results" style={{
                                    listStyle: 'none', padding: 0, margin: 0,
                                    position: 'absolute', width: '100%',
                                    background: 'white', border: '1px solid #ddd',
                                    zIndex: 100, maxHeight: '200px', overflowY: 'auto'
                                }}>
                                    {searchResults.map(med => (
                                        <li key={med._id}
                                            onClick={() => handleAddToCart(med)}
                                            style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{med.name}</div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>{med.genericName} - ${med.price}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
                            <h4>Cart Items ({cartItems.length})</h4>
                            {cartItems.length === 0 ? (
                                <div style={{ color: '#888', fontStyle: 'italic' }}>No medicines added yet</div>
                            ) : (
                                <div className="cart-list">
                                    {cartItems.map(item => (
                                        <div key={item.medicineId} className="cart-item-card" style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px'
                                        }}>
                                            <div>
                                                <strong>{item.name}</strong>
                                                <div>${item.price}</div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                                                    className="btn-icon"
                                                    style={{ width: '25px', height: '25px', borderRadius: '50%' }}
                                                    disabled={cartLoading}
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                                                    className="btn-icon"
                                                    style={{ width: '25px', height: '25px', borderRadius: '50%' }}
                                                    disabled={cartLoading}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.medicineId)}
                                                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: '10px' }}
                                onClick={handleApproveOrder}
                                disabled={cartItems.length === 0 || cartLoading}
                            >
                                Approve Order with Selected Medicines
                            </button>
                            <button
                                className="btn btn-danger"
                                style={{ width: '100%' }}
                                onClick={openRejectModal}
                                disabled={cartLoading}
                            >
                                Reject Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Reject Order Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reject Order</h3>
                        <p>Are you sure you want to reject this order?</p>
                        <div className="form-group">
                            <label>Reason for Rejection *</label>
                            <textarea
                                className="form-textarea"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please explain why the order is being rejected..."
                                rows="3"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-danger"
                                onClick={confirmRejection}
                                disabled={cartLoading}
                            >
                                {cartLoading ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={closeRejectModal}
                                disabled={cartLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrescriptionReview;