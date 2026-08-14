import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4 className="footer-title">MediConnect</h4>
                        <p className="footer-text">
                            Your trusted healthcare platform for easy appointment booking and online pharmacy services.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Patients</h5>
                        <ul className="footer-links">
                            <li><Link to="/dashboard">My Dashboard</Link></li>
                            <li><Link to="/dashboard?tab=appointments">My Appointments</Link></li>
                            <li><Link to="/dashboard?tab=orders">My Orders</Link></li>
                            <li><Link to="/dashboard?tab=medical-history">Health Records</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Quick Links</h5>
                        <ul className="footer-links">
                            <li><Link to="/doctors">Find Doctors</Link></li>
                            <li><Link to="/pharmacy">Pharmacy</Link></li>
                            <li><Link to="/appointments">Appointments</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Support</h5>
                        <ul className="footer-links">
                            <li><Link to="/contact">Help Center</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Contact</h5>
                        <p className="footer-text">Email: support@mediconnect.com</p>
                        <p className="footer-text">Phone: 1-800-MEDICONNECT</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 MediConnect. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
