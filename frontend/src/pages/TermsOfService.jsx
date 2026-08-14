import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const TermsOfService = () => {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px', backgroundColor: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h1 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Terms of Service</h1>
                <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>Last Updated: December 6, 2025</p>

                <div style={{ lineHeight: '1.8', color: '#34495e' }}>
                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using MediConnect, you accept and agree to be bound by the terms and provision of this agreement.
                        If you do not agree to abide by the above, please do not use this service.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>2. Use License</h2>
                    <p>
                        Permission is granted to temporarily access MediConnect for personal, non-commercial use only.
                        This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li>Modify or copy the materials</li>
                        <li>Use the materials for any commercial purpose</li>
                        <li>Attempt to reverse engineer any software contained on MediConnect</li>
                        <li>Remove any copyright or other proprietary notations from the materials</li>
                    </ul>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>3. Medical Disclaimer</h2>
                    <p>
                        MediConnect is a platform that connects patients with healthcare providers. We do not provide medical advice,
                        diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any
                        questions you may have regarding a medical condition.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>4. Prescription Services</h2>
                    <p>
                        All prescription orders must be accompanied by a valid prescription from a licensed healthcare provider.
                        We reserve the right to refuse any order that does not meet our verification standards.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>5. Privacy and Data Protection</h2>
                    <p>
                        Your use of MediConnect is also governed by our Privacy Policy. We collect and process personal health
                        information in accordance with applicable healthcare privacy laws and regulations.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>6. User Responsibilities</h2>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li>You must provide accurate and complete information when creating an account</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                        <li>You must notify us immediately of any unauthorized use of your account</li>
                        <li>You agree not to share prescription medications obtained through our service</li>
                    </ul>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>7. Payment and Refunds</h2>
                    <p>
                        Payment is required at the time of order placement. Refunds may be issued at our discretion for
                        unfulfilled orders or in cases of shipping errors. Prescription medications cannot be returned once shipped.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>8. Limitation of Liability</h2>
                    <p>
                        MediConnect shall not be held liable for any damages arising from the use or inability to use our service,
                        including but not limited to direct, indirect, incidental, punitive, and consequential damages.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>9. Modifications to Terms</h2>
                    <p>
                        We reserve the right to revise these terms of service at any time. By using this website, you are agreeing
                        to be bound by the current version of these terms of service.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>10. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us at:
                        <br />
                        Email: legal@mediconnect.com
                        <br />
                        Phone: 1-800-MEDICONNECT
                    </p>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <Link to="/" className="btn btn-primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
