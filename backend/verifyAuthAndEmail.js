const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function verifyAuthAndEmail() {
    console.log('=== VERIFYING AUTH & EMAIL ===\n');

    try {
        // 1. Test Patient Registration
        console.log('1. Testing Patient Registration...');
        const uniqueEmail = `testpatient${Date.now()}@example.com`;
        const patientData = {
            firstName: 'Test',
            lastName: 'Patient',
            email: uniqueEmail,
            password: 'password123',
            phone: '1234567890',
            dateOfBirth: '1990-01-01',
            gender: 'male'
        };

        let registerRes;
        try {
            registerRes = await axios.post(`${API_URL}/auth/register`, patientData);
            console.log('   ✅ Registration Successful');
            console.log(`   User ID: ${registerRes.data.user.id}`);
        } catch (error) {
            console.error('   ❌ Registration Failed:', error.response?.data || error.message);
            return;
        }

        // 2. Test Patient Login
        console.log('\n2. Testing Patient Login...');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: uniqueEmail,
                password: 'password123'
            });
            console.log('   ✅ Login Successful');
            console.log(`   Token received: ${loginRes.data.token ? 'Yes' : 'No'}`);
        } catch (error) {
            console.error('   ❌ Login Failed:', error.response?.data || error.message);
        }

        // 3. Test Doctor Login (using seeded doctor)
        console.log('\n3. Testing Doctor Login...');
        try {
            const doctorEmail = 'arjun.rao@mediconnect.com'; // From seedDoctors.js
            const doctorLoginRes = await axios.post(`${API_URL}/auth/login`, {
                email: doctorEmail,
                password: 'doctor123'
            });
            console.log('   ✅ Doctor Login Successful');
            console.log(`   Doctor Name: ${doctorLoginRes.data.user.name}`);
        } catch (error) {
            console.error('   ❌ Doctor Login Failed:', error.response?.data || error.message);
        }

        // 4. Test Email Sending (via Forgot Password)
        console.log('\n4. Testing Email Sending (Forgot Password)...');
        try {
            // Use the patient email we just registered (or a real one if configured)
            // Since we are using a fake email, it might fail if the SMTP server validates recipients strictly,
            // but for Gmail it usually accepts it or bounces later.
            // Better to use the configured sender email to be safe it doesn't bounce immediately?
            // Actually, let's use the email from .env to test actual delivery if possible,
            // but the user might not want spam.
            // Let's use the fake email and see if the *sending logic* works (i.e., no SMTP connection errors).

            const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, {
                email: uniqueEmail
            });
            console.log('   ✅ Email Sending Triggered Successfully');
            console.log(`   Response: ${forgotRes.data.message}`);
        } catch (error) {
            console.error('   ❌ Email Sending Failed:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

verifyAuthAndEmail();
