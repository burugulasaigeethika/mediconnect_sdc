const nodemailer = require('nodemailer');
const { config } = require('../config/env');
const {
    otpTemplate,
    appointmentConfirmationTemplate,
    appointmentRejectionTemplate,
    doctorNotificationTemplate,
    contactFormTemplate,
    doctorPrescriptionTemplate
} = require('./emailTemplates');

// Create transporter with configuration
const createTransporter = () => {
    if (!config.features.emailEnabled) {
        console.warn('⚠️  Email is not configured. Emails will not be sent.');
        return null;
    }

    // Use SMTP configuration
    if (config.email.host && config.email.user && config.email.pass) {
        const port = parseInt(config.email.port);
        return nodemailer.createTransport({
            host: config.email.host,
            port: port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user: config.email.user,
                pass: config.email.pass
            },
            tls: {
                rejectUnauthorized: false
            },
            // Add connection timeout
            connectionTimeout: 10000,
            greetingTimeout: 5000
        });
    }

    console.error('❌ Email configuration is incomplete');
    return null;
};

// Verify transporter connectivity with timeout
const verifyTransporter = async (transporter) => {
    if (!transporter) return false;

    try {
        // Set a timeout for verification
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Verification timeout')), 5000);
        });

        const verification = transporter.verify();
        await Promise.race([verification, timeout]);

        console.log('✅ SMTP transporter verified successfully');
        return true;
    } catch (error) {
        console.error('❌ SMTP transporter verification failed:', error.message);
        return false;
    }
};

/**
 * Send email with retry mechanism
 */
const sendEmailWithRetry = async (mailOptions, retries = 3) => {
    const transporter = createTransporter();

    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Email sending timeout')), 10000);
            });

            const sendMail = transporter.sendMail(mailOptions);
            const info = await Promise.race([sendMail, timeout]);

            console.log(`✅ Email sent successfully (attempt ${attempt}):`, info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Email send attempt ${attempt} failed:`, error.message);

            if (attempt === retries) {
                return { success: false, error: error.message };
            }

            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }

    return { success: false, error: 'All retry attempts failed' };
};

// Send OTP email for password reset
const sendOTPEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: email,
            subject: 'Password Reset OTP - MediConnect',
            html: otpTemplate(name, otp)
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error preparing OTP email:', error);
        return { success: false, error: error.message };
    }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (patientEmail, patientName, doctorName, appointmentDetails) => {
    try {
        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: patientEmail,
            subject: 'Appointment Confirmed - MediConnect',
            html: appointmentConfirmationTemplate(patientName, doctorName, appointmentDetails)
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error sending appointment confirmation:', error);
        return { success: false, error: error.message };
    }
};

// Send new appointment notification email to doctor
const sendDoctorNotificationEmail = async (doctorEmail, doctorName, patientName, appointmentDetails) => {
    try {
        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: doctorEmail,
            subject: 'New Appointment Request - MediConnect',
            html: doctorNotificationTemplate(doctorName, patientName, appointmentDetails)
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error sending doctor notification:', error);
        return { success: false, error: error.message };
    }
};

// Send appointment rejection email
const sendAppointmentRejection = async (patientEmail, patientName, doctorName, appointmentDetails, reason) => {
    try {
        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: patientEmail,
            subject: 'Appointment Update - MediConnect',
            html: appointmentRejectionTemplate(patientName, doctorName, appointmentDetails.date, appointmentDetails.time, reason)
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error sending appointment rejection:', error);
        return { success: false, error: error.message };
    }
};

// Send contact form email
const sendContactFormEmail = async (name, email, phone, message) => {
    try {
        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: config.email.contactEmail || config.email.user,
            subject: 'New Contact Form Submission - MediConnect',
            html: contactFormTemplate(name, email, phone, message),
            replyTo: email
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error sending contact form email:', error);
        return { success: false, error: error.message };
    }
};

// Send prescription approval email to patient
const sendPrescriptionApprovalEmail = async (patientEmail, patientName, orderId, medicines, totalAmount) => {
    try {
        const { prescriptionApprovalTemplate } = require('./emailTemplates');

        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: patientEmail,
            subject: 'Prescription Approved - MediConnect',
            html: prescriptionApprovalTemplate(patientName, orderId, medicines, totalAmount)
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error sending prescription approval email:', error);
        return { success: false, error: error.message };
    }
};

// Send doctor prescription email to patient (for online consultations)
const sendDoctorPrescriptionEmail = async (patientEmail, patientName, doctorName, prescriptionUrl) => {
    try {
        const mailOptions = {
            from: `"MediConnect" <${config.email.user}>`,
            to: patientEmail,
            subject: `Your Prescription from Dr. ${doctorName} - MediConnect`,
            html: doctorPrescriptionTemplate(patientName, doctorName, prescriptionUrl)
        };

        return await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('❌ Error sending doctor prescription email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendAppointmentConfirmation,
    sendAppointmentRejection,
    sendDoctorNotificationEmail,
    sendContactFormEmail,
    sendPrescriptionApprovalEmail,
    sendDoctorPrescriptionEmail,
    createTransporter,
    verifyTransporter
};