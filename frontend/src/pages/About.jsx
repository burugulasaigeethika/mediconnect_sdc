import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const About = () => {
    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">About MediConnect</h1>
                        <p className="hero-subtitle">
                            Revolutionizing healthcare access through technology
                        </p>
                    </div>
                </div>
            </div>

            <div className="container">
                <section className="features-section">
                    <div className="section-header">
                        <h2>Our Mission</h2>
                        <p className="section-description">
                            Connecting patients with quality healthcare services
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🏥</div>
                            <h3>Accessible Healthcare</h3>
                            <p>Providing easy access to healthcare services for everyone, everywhere.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">👨‍⚕️</div>
                            <h3>Expert Doctors</h3>
                            <p>Connecting you with qualified and experienced healthcare professionals.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💊</div>
                            <h3>Medicine Delivery</h3>
                            <p>Get your prescribed medications delivered to your doorstep.</p>
                        </div>
                    </div>
                </section>

                <section className="about-content">
                    <h2>Who We Are</h2>
                    <p>
                        MediConnect is a comprehensive healthcare platform designed to bridge the gap between 
                        patients and healthcare providers. Our mission is to make quality healthcare accessible, 
                        affordable, and convenient for everyone.
                    </p>
                    
                    <p>
                        Founded by a team of healthcare professionals and technology experts, MediConnect 
                        combines cutting-edge technology with medical expertise to deliver exceptional 
                        healthcare experiences.
                    </p>

                    <h3>Our Values</h3>
                    <ul>
                        <li><strong>Patient-Centered Care:</strong> Putting patients first in everything we do</li>
                        <li><strong>Innovation:</strong> Continuously improving our platform with the latest technology</li>
                        <li><strong>Accessibility:</strong> Making healthcare available to all communities</li>
                        <li><strong>Quality:</strong> Ensuring the highest standards in healthcare delivery</li>
                        <li><strong>Trust:</strong> Building reliable relationships with our users</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default About;