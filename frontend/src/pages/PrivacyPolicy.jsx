import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const PrivacyPolicy = () => {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px', backgroundColor: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h1 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Privacy Policy</h1>
                <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>Last Updated: December 6, 2025</p>

                <div style={{ lineHeight: '1.8', color: '#34495e' }}>
                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>1. Information We Collect</h2>
                    <p>We collect several types of information to provide and improve our service:</p>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, gender</li>
                        <li><strong>Health Information:</strong> Medical history, prescriptions, lab reports, appointment records</li>
                        <li><strong>Payment Information:</strong> Billing address, payment method details</li>
                        <li><strong>Usage Data:</strong> How you interact with our platform, pages visited, time spent</li>
                    </ul>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>2. How We Use Your Information</h2>
                    <p>Your information is used for the following purposes:</p>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li>To provide healthcare services and process prescriptions</li>
                        <li>To facilitate appointments with healthcare providers</li>
                        <li>To process payments and prevent fraud</li>
                        <li>To send service updates and important notifications</li>
                        <li>To improve our platform and user experience</li>
                        <li>To comply with legal and regulatory requirements</li>
                    </ul>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>3. HIPAA Compliance</h2>
                    <p>
                        MediConnect is committed to protecting your health information in accordance with the Health Insurance
                        Portability and Accountability Act (HIPAA). We implement appropriate safeguards to ensure the
                        confidentiality, integrity, and security of your protected health information (PHI).
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>4. Information Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li><strong>Healthcare Providers:</strong> Doctors and pharmacists who provide services to you</li>
                        <li><strong>Payment Processors:</strong> To process your transactions securely</li>
                        <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                        We do not sell your personal information to third parties.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures including:
                    </p>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li>Encryption of data in transit and at rest</li>
                        <li>Regular security audits and assessments</li>
                        <li>Access controls and authentication mechanisms</li>
                        <li>Employee training on privacy and security practices</li>
                    </ul>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                        <li>Access your personal and health information</li>
                        <li>Request corrections to inaccurate information</li>
                        <li>Request deletion of your data (subject to legal requirements)</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Request a copy of your data in a portable format</li>
                    </ul>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>7. Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve
                        our services. You can control cookie preferences through your browser settings.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>8. Data Retention</h2>
                    <p>
                        We retain your information for as long as necessary to provide our services and comply with legal
                        obligations. Medical records are retained in accordance with healthcare regulations.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>9. Children's Privacy</h2>
                    <p>
                        Our services are not intended for individuals under the age of 18. We do not knowingly collect
                        information from children without parental consent.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any material changes by
                        posting the new policy on this page and updating the "Last Updated" date.
                    </p>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>11. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
                        <br />
                        Email: privacy@mediconnect.com
                        <br />
                        Phone: 1-800-MEDICONNECT
                        <br />
                        Address: MediConnect Privacy Office, 123 Healthcare Blvd, Medical City, MC 12345
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

export default PrivacyPolicy;
