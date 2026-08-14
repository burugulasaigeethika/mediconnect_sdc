import React, { useState } from 'react';
import axios from 'axios';
import { showErrorToast } from '../utils/toast';
import './Home.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log('Submitting contact form with data:', formData);
            const response = await axios.post('/api/contact/submit', formData);
            console.log('Contact form response:', response.data);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Reset the submitted state after 5 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 5000);
        } catch (error) {
            console.error('Error submitting contact form:', error);
            console.error('Error response:', error.response?.data);
            showErrorToast('Error submitting form. Please try again.');
        }
    };

    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Contact Us</h1>
                        <p className="hero-subtitle">
                            We'd love to hear from you. Get in touch with our team.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="contact-layout">
                    <div className="contact-info">
                        <h2>Get In Touch</h2>
                        <p>
                            Have questions or feedback? Our team is here to help you with any inquiries
                            about our services.
                        </p>

                        <div className="contact-details">
                            <div className="contact-item">
                                <div className="contact-icon">📍</div>
                                <div>
                                    <h3>Our Location</h3>
                                    <p>123 Healthcare Avenue<br />Medical District, HC 12345</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">📞</div>
                                <div>
                                    <h3>Phone Number</h3>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">✉️</div>
                                <div>
                                    <h3>Email Address</h3>
                                    <p>support@mediconnect.com</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">🕒</div>
                                <div>
                                    <h3>Working Hours</h3>
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form">
                        <h2>Send us a Message</h2>
                        {submitted && (
                            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                                Thank you for your message! We will get back to you soon.
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter subject"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your message"
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;