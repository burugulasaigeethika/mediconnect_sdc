import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Toast from '../components/Toast';
import './PharmacistDashboard.css';

const AddMedicinesToOrder = ({ orderId: propOrderId, setActiveTab }) => {
    const params = useParams();
    const orderId = propOrderId || params.orderId;

    const { ensureAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [approving, setApproving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        if (!orderId || orderId === 'undefined') {
            setLoading(false);
            return;
        }

        try {
            ensureAuthHeaders(); // Ensure auth headers are set

            const response = await axios.get(`/api/prescription-orders/${orderId}`);
            setOrder(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching order details:', err);

            // Fallback: If direct access is denied (stale server issue), try fetching from list
            if (err.response && err.response.status === 403) {
                try {
                    console.log('Direct access denied, attempting fallback fetch via /all...');
                    const allOrdersResponse = await axios.get('/api/prescription-orders/all');
                    const foundOrder = allOrdersResponse.data.find(o => o._id === orderId || o.orderId === orderId);

                    if (foundOrder) {
                        console.log('Order found via fallback method');
                        setOrder(foundOrder);
                        setLoading(false);
                        return;
                    }
                } catch (fallbackErr) {
                    console.error('Fallback fetch failed:', fallbackErr);
                }
            }

            setError(err.response?.data?.message || 'Failed to fetch order details');
            setLoading(false);
        }
    };

    const searchMedicines = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            ensureAuthHeaders(); // Ensure auth headers are set
            const response = await axios.get(`/api/prescription-orders/medicines/search?query=${encodeURIComponent(query)}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error('Error searching medicines:', err);
            setError(err.response?.data?.message || 'Failed to search medicines');
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchMedicines(value);
    };

    const addMedicineToOrder = (medicine) => {
        // Check if medicine is already added
        const existing = selectedMedicines.find(item => item.medicineId === medicine._id);
        if (existing) {
            showToast('This medicine is already added to the order', 'warning');
            return;
        }

        setSelectedMedicines([
            ...selectedMedicines,
            {
                medicineId: medicine._id,
                name: medicine.name,
                quantity: 1,
                price: medicine.price
            }
        ]);

        // Clear search
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateMedicineQuantity = (index, quantity) => {
        if (quantity < 1) return;

        const updated = [...selectedMedicines];
        updated[index].quantity = quantity;
        setSelectedMedicines(updated);
    };

    const updateMedicinePrice = (index, price) => {
        if (price < 0) return;

        const updated = [...selectedMedicines];
        updated[index].price = price;
        setSelectedMedicines(updated);
    };

    const removeMedicine = (index) => {
        const updated = [...selectedMedicines];
        updated.splice(index, 1);
        setSelectedMedicines(updated);
    };

    const calculateTotal = () => {
        return selectedMedicines.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleApprove = async () => {
        if (selectedMedicines.length === 0) {
            showToast('Please add at least one medicine to the order', 'warning');
            return;
        }

        if (!window.confirm('Are you sure you want to approve this prescription with the selected medicines?')) {
            return;
        }

        setApproving(true);

        setApproving(true);

        try {
            ensureAuthHeaders(); // Ensure auth headers are set
            const response = await axios.patch(`/api/prescription-orders/${orderId}/approve`, {
                medicines: selectedMedicines
            });

            if (response.data.order) {
                showToast('Prescription approved successfully!', 'success');
                // Navigate back to prescription review
                setTimeout(() => {
                    if (setActiveTab) {
                        setActiveTab('prescription-review');
                    } else {
                        navigate('/pharmacist/prescription-review');
                    }
                }, 1500);
            }
        } catch (err) {
            console.error('Error approving prescription:', err);
            showToast(err.response?.data?.message || 'Failed to approve prescription', 'error');
        } finally {
            setApproving(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading order details...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <h2>Review Prescription & Add Medicines</h2>
                <p>Order ID: {orderId}</p>
            </div>

            <div className="add-medicines-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: 'calc(100vh - 150px)' }}>
                {/* Left Side: Prescription Image */}
                <div className="prescription-viewer" style={{
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h3 style={{ marginBottom: '15px', width: '100%' }}>Prescription</h3>
                    {order?.prescriptionFile ? (
                        <>
                            <div className="image-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={(() => {
                                        if (!order.prescriptionFile) return '';
                                        if (order.prescriptionFile.startsWith('http') || order.prescriptionFile.startsWith('data:')) {
                                            return order.prescriptionFile;
                                        }
                                        // Prepend backend URL for local uploads
                                        const cleanPath = order.prescriptionFile.replace(/^\/+/, '');
                                        return `http://localhost:5000/${cleanPath}`;
                                    })()}
                                    alt="Prescription"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
                                    }}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </div>
                            <p style={{ marginTop: '10px', fontSize: '10px', color: '#888', wordBreak: 'break-all' }}>
                                Debug URL: {(() => {
                                    if (!order.prescriptionFile) return 'None';
                                    if (order.prescriptionFile.startsWith('http') || order.prescriptionFile.startsWith('data:')) {
                                        return order.prescriptionFile;
                                    }
                                    const cleanPath = order.prescriptionFile.replace(/^\/+/, '');
                                    return `http://localhost:5000/${cleanPath}`;
                                })()}
                            </p>
                        </>
                    ) : (
                        <div className="no-image" style={{ color: '#64748b', textAlign: 'center', marginTop: '50px' }}>
                            No prescription image available
                        </div>
                    )}
                    {order?.patientName && (
                        <div className="patient-info" style={{ marginTop: '20px', width: '100%', padding: '15px', background: 'white', borderRadius: '8px' }}>
                            <strong>Patient:</strong> {order.patientName} <br />
                            <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                    )}
                </div>

                {/* Right Side: Medicine Search & Cart */}
                <div className="add-medicines-content" style={{ overflowY: 'auto', padding: '0 5px' }}>
                    {/* Medicine Search Section */}
                    <div className="search-section">
                        <h3>Search Medicines</h3>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search medicines..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="form-input"
                            />
                        </div>

                        {searchResults.length > 0 && (
                            <div className="search-results">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map(medicine => (
                                            <tr key={medicine._id}>
                                                <td>{medicine.name}</td>
                                                <td><span className="badge">{medicine.category}</span></td>
                                                <td>₹{medicine.price.toFixed(2)}</td>
                                                <td>{medicine.stock}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => addMedicineToOrder(medicine)}
                                                    >
                                                        Add
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Selected Medicines Section */}
                    <div className="selected-medicines">
                        <h3>Selected Medicines</h3>

                        {selectedMedicines.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🛒</div>
                                <p>No medicines added yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="medicines-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Medicine</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedMedicines.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name}</td>
                                                    <td>
                                                        <div className="quantity-control">
                                                            <button
                                                                onClick={() => updateMedicineQuantity(index, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateMedicineQuantity(index, parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                className="quantity-input"
                                                            />
                                                            <button
                                                                onClick={() => updateMedicineQuantity(index, item.quantity + 1)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateMedicinePrice(index, parseFloat(e.target.value) || 0)}
                                                            min="0"
                                                            step="0.01"
                                                            className="price-input"
                                                        />
                                                    </td>
                                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => removeMedicine(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="order-summary">
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="actions">
                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={handleApprove}
                                        disabled={approving}
                                    >
                                        {approving ? 'Approving...' : 'Approve Prescription'}
                                    </button>

                                    <button
                                        className="btn btn-secondary btn-block"
                                        onClick={() => {
                                            if (setActiveTab) {
                                                setActiveTab('prescription-review');
                                            } else {
                                                navigate('/pharmacist/prescription-review');
                                            }
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {toast && (
                <div className="toast-container">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                        duration={3000}
                    />
                </div>
            )}
        </div >
    );
};

export default AddMedicinesToOrder;