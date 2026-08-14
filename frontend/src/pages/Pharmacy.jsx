import React, { useState, useEffect } from 'react';
import { fetchMedicines, fetchMedicinesByCategory, searchMedicines } from '../services/medicineService';
import { showSuccessToast } from '../utils/toast';
import './Pharmacy.css';

const Pharmacy = () => {
    const [medicines, setMedicines] = useState([]);
    const [basicNeeds, setBasicNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchProducts();
        // Load cart from localStorage
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            if (searchTerm) {
                // Use search function
                const searchResults = await searchMedicines(searchTerm);

                // Filter products into categories
                const meds = searchResults.filter(p =>
                    (p.category || '').includes('Medicine') || (p.category || '').includes('Treatment') || (p.category || '') === 'Medicines & Treatments'
                );
                const needs = searchResults.filter(p =>
                    (p.category || '').includes('Basic') || (p.category || '') === 'Basic Needs'
                );

                setMedicines(meds);
                setBasicNeeds(needs);
            } else {
                // Fetch all medicines when no search term
                const allProducts = await fetchMedicines();

                // Filter products into categories
                const meds = allProducts.filter(p =>
                    (p.category || '').includes('Medicine') || (p.category || '').includes('Treatment') || (p.category || '') === 'Medicines & Treatments'
                );
                const needs = allProducts.filter(p =>
                    (p.category || '').includes('Basic') || (p.category || '') === 'Basic Needs'
                );

                setMedicines(meds);
                setBasicNeeds(needs);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.medicine._id === product._id);
        let newCart;
        if (existingItem) {
            newCart = cart.map(item =>
                item.medicine._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            newCart = [...cart, { medicine: product, quantity: 1 }];
        }
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        showSuccessToast(`${product.name || 'Product'} added to cart!`);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const ProductCard = ({ product }) => {
        // Handle local database data format
        const productName = product.name || 'Unknown Product';
        const manufacturer = product.manufacturer || 'Generic';
        const price = product.price || 0;
        const mrp = product.mrp || product.price || 0;
        const discount = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
        const stock = product.stock !== undefined ? product.stock : 100;
        const category = product.category || 'Medicine';

        return (
            <div className="product-card">
                <div className="product-image-placeholder">
                    <div className="placeholder-icon">
                        {category.includes('Basic') || category === 'Basic Needs' ? '🧴' : '💊'}
                    </div>
                </div>
                <div className="product-info">
                    <h3 className="product-title">{productName}</h3>
                    <p className="product-manufacturer">{manufacturer}</p>

                    <div className="product-pricing">
                        <div className="price-row">
                            <span className="selling-price">₹{price}</span>
                            {mrp && mrp > price && (
                                <>
                                    <span className="mrp">MRP <del>₹{mrp}</del></span>
                                    <span className="discount-badge">{discount}% OFF</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                        disabled={stock === 0}
                    >
                        {stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="pharmacy-page">
            <div className="container">
                <div className="pharmacy-header">
                    <div className="header-content">
                        <h1>Online Pharmacy</h1>
                        <p>Genuine Medicines & Essentials Delivered</p>
                    </div>
                    <a href="/cart" className="cart-link">
                        <span className="cart-icon">🛒</span>
                        <span className="cart-count">{getCartCount()}</span>
                    </a>
                </div>

                <div className="search-section">
                    <div className="search-controls">
                        <input
                            type="text"
                            className="search-input-large"
                            placeholder="Search for medicines, health products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Basic Needs Section */}
                        <section className="product-section basic-needs-section">
                            <div className="section-header">
                                <h2>Basic Needs</h2>
                                <span className="section-subtitle">Daily Essentials</span>
                            </div>
                            <div className="products-grid">
                                {basicNeeds.length > 0 ? (
                                    basicNeeds.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                ) : (
                                    <p className="no-products">No basic needs products found.</p>
                                )}
                            </div>
                        </section>

                        {/* Medicines & Treatments Section */}
                        <section className="product-section">
                            <div className="section-header">
                                <h2>Medicines & Treatments</h2>
                                <span className="section-subtitle">Allopathy / OTC Medicines</span>
                            </div>
                            <div className="products-grid">
                                {medicines.length > 0 ? (
                                    medicines.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                ) : (
                                    <p className="no-products">No medicines found.</p>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default Pharmacy;