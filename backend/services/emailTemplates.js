/**
 * Email Templates Module
 * Centralized email HTML templates with dynamic content
 */

const { config } = require('../config/env');

/**
 * Base email template wrapper
 */
const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #0066FF 0%, #4D94FF 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #0066FF;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background: #0052CC;
        }
        .details-box {
            background: #f8f9fa;
            border-left: 4px solid #0066FF;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #64748b;
        }
        .alert-box {
            background: #fff8e6;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .success-box {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .otp-box {
            background: #ffffff;
            border: 2px dashed #0066FF;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
        }
        .otp-code {
            color: #0066FF;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MediConnect</h1>
            <p>${title}</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© ${new Date().getFullYear()} MediConnect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * OTP Email Template
 */
const otpTemplate = (name, otp) => {
    const content = `
        <h2>Password Reset Request</h2>
        <p>Hello <strong>${name || 'User'}</strong>,</p>
        <p>You requested to reset your password. Please use the following OTP to verify your identity:</p>
        
        <div class="otp-box">
            <h1 class="otp-code">${otp}</h1>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">One-Time Password</p>
        </div>
        
        <div class="alert-box">
            <strong>⚠️ Important:</strong> This OTP will expire in <strong>5 minutes</strong>. 
            If you didn't request this, please ignore this email.
        </div>
        
        <p>Thank you for using MediConnect!</p>
    `;

    return baseTemplate('Password Reset OTP', content);
};

/**
 * Appointment Confirmation Email Template
 */
const appointmentConfirmationTemplate = (patientName, doctorName, appointmentDetails) => {
    const content = `
        <h2>Appointment Confirmed! 🎉</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.</p>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <div class="detail-row">
                <span class="detail-label">Doctor:</span>
                <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${appointmentDetails.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${appointmentDetails.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span style="color: #22c55e; font-weight: bold;">✓ Confirmed</span>
            </div>
        </div>
        
        <div class="success-box">
            <p style="margin: 0;"><strong>What to bring:</strong></p>
            <ul style="margin: 10px 0;">
                <li>Valid ID proof</li>
                <li>Previous medical records (if any)</li>
                <li>List of current medications</li>
            </ul>
        </div>
        
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        
        <center>
            <a href="${config.frontendUrl}/appointments" class="button">View My Appointments</a>
        </center>
    `;

    return baseTemplate('Appointment Confirmed', content);
};

/**
 * Doctor Notification Email Template
 */
const doctorNotificationTemplate = (doctorName, patientName, appointmentDetails) => {
    const content = `
        <h2>New Appointment Request 📋</h2>
        <p>Hello <strong>Dr. ${doctorName}</strong>,</p>
        <p>You have a new appointment request from <strong>${patientName}</strong>.</p>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <div class="detail-row">
                <span class="detail-label">Patient:</span>
                <span>${patientName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${appointmentDetails.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${appointmentDetails.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span style="color: #ff9800; font-weight: bold;">⏳ Pending Review</span>
            </div>
        </div>
        
        <div class="alert-box">
            <strong>Action Required:</strong> Please review and accept/reject this appointment request in your dashboard.
        </div>
        
        <center>
            <a href="${config.frontendUrl}/doctor-dashboard" class="button">View Dashboard</a>
        </center>
    `;

    return baseTemplate('New Appointment Request', content);
};

/**
 * Appointment Rejection Email Template
 */
const appointmentRejectionTemplate = (patientName, doctorName, date, time, reason) => {
    const content = `
        <h2>Appointment Update</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong> has been declined.</p>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <div class="detail-row">
                <span class="detail-label">Doctor:</span>
                <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span style="color: #ef4444; font-weight: bold;">✕ Declined</span>
            </div>
        </div>
        
        <div class="alert-box">
            <strong>Reason for Rejection:</strong>
            <p style="margin: 10px 0 0 0;">${reason || 'Unavailable for the requested time slot.'}</p>
        </div>
        
        <p>Please visit our website to book a new appointment at a different time.</p>
        
        <center>
            <a href="${config.frontendUrl}/doctors" class="button">Find Another Doctor</a>
        </center>
    `;

    return baseTemplate('Appointment Update', content);
};

/**
 * Contact Form Email Template
 */
const contactFormTemplate = (name, email, phone, message) => {
    const content = `
        <h2>New Contact Form Submission</h2>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Contact Information</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span>${name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span>${email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span>${phone || 'Not provided'}</span>
            </div>
        </div>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p><em>This message was sent via the MediConnect contact form.</em></p>
    `;

    return baseTemplate('New Contact Form Submission', content);
};

/**
 * Prescription Approval Email Template
 */
const prescriptionApprovalTemplate = (patientName, orderId, medicines, totalAmount) => {
    const medicinesList = medicines.map(med => `
        <div class="detail-row">
            <span class="detail-label">${med.name}</span>
            <span>Qty: ${med.quantity} × ₹${med.price} = ₹${med.quantity * med.price}</span>
        </div>
    `).join('');

    const content = `
        <h2>Prescription Approved! ✅</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Great news! Your prescription has been validated and approved by our pharmacist.</p>
        
        <div class="success-box">
            <strong>✓ Your prescription has been validated and is ready for payment</strong>
        </div>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Order Details</h3>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span>${orderId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span style="color: #22c55e; font-weight: bold;">✓ Approved - Awaiting Payment</span>
            </div>
        </div>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Medicines</h3>
            ${medicinesList}
            <div class="detail-row" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #0066FF;">
                <span class="detail-label" style="font-size: 16px;">Total Amount:</span>
                <span style="font-size: 18px; font-weight: bold; color: #0066FF;">₹${totalAmount}</span>
            </div>
        </div>
        
        <div class="alert-box">
            <strong>Next Steps:</strong>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Proceed to payment to complete your order</li>
                <li>Your medicines will be delivered to your registered address</li>
                <li>Expected delivery: 2-3 business days</li>
            </ol>
        </div>
        
        <center>
            <a href="${config.frontendUrl}/view-order/${orderId}" class="button">View Order & Make Payment</a>
        </center>
        
        <p>Thank you for choosing MediConnect!</p>
    `;

    return baseTemplate('Prescription Approved', content);
};

/**
 * Doctor Prescription Email Template (for online consultations)
 */
const doctorPrescriptionTemplate = (patientName, doctorName, prescriptionUrl) => {
    const content = `
        <h2>Your Prescription is Ready! 📄</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Great news! Dr. <strong>${doctorName}</strong> has uploaded your prescription from your recent online consultation.</p>
        
        <div class="success-box">
            <strong>✓ Your prescription is ready for download</strong>
        </div>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Prescription Details</h3>
            <div class="detail-row">
                <span class="detail-label">Doctor:</span>
                <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Issued:</span>
                <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span style="color: #0066FF; font-weight: bold;">Online Consultation</span>
            </div>
        </div>
        
        <center>
            <a href="${prescriptionUrl}" class="button" download>📥 Download Prescription</a>
        </center>
        
        <div class="alert-box">
            <strong>Next Steps:</strong>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Download the prescription file using the button above</li>
                <li>Review the prescribed medications and instructions</li>
                <li>Visit the <strong>MediConnect Pharmacy</strong> section to order medicines</li>
                <li>Upload this prescription when placing your pharmacy order</li>
            </ol>
        </div>
        
        <p>You can access the pharmacy section by logging into your MediConnect account and navigating to the Pharmacy page.</p>
        
        <center>
            <a href="${config.frontendUrl}/pharmacy" class="button" style="background: #22c55e;">Visit Pharmacy Section</a>
        </center>
        
        <p>If you have any questions about your prescription, please contact your doctor or our support team.</p>
    `;

    return baseTemplate('Prescription Ready for Download', content);
};

module.exports = {
    otpTemplate,
    appointmentConfirmationTemplate,
    appointmentRejectionTemplate,
    doctorNotificationTemplate,
    contactFormTemplate,
    prescriptionApprovalTemplate,
    doctorPrescriptionTemplate
};
