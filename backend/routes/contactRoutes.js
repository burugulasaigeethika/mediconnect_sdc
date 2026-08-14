const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Contact message model (in-memory storage for demo purposes)
// In production, you would save this to a database
let contactMessages = [];

// Submit contact form
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }
        
        // Create contact message object
        const contactMessage = {
            id: Date.now().toString(),
            name,
            email,
            subject,
            message,
            timestamp: new Date(),
            status: 'received'
        };
        
        // Save to in-memory storage (in production, save to database)
        contactMessages.push(contactMessage);
        
        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Email content for admin notification
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
                        <h3>Message:</h3>
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <p><small>Received: ${new Date().toLocaleString()}</small></p>
                </div>
            `
        };
        
        // Email content for user confirmation
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting MediConnect',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Thank You for Your Message</h2>
                    <p>Dear ${name},</p>
                    <p>Thank you for contacting MediConnect. We have received your message and will get back to you within 24-48 hours.</p>
                    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
                        <h3>Your Message Summary:</h3>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Message:</strong> ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</p>
                    </div>
                    <p>Best regards,<br>The MediConnect Team</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            `
        };
        
        // Send emails if email configuration exists
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            try {
                // Send notification to admin
                await transporter.sendMail(adminMailOptions);
                
                // Send confirmation to user
                await transporter.sendMail(userMailOptions);
                
                contactMessage.status = 'emails_sent';
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                // Log specific error details
                console.error('Email config:', {
                    EMAIL_USER: process.env.EMAIL_USER,
                    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
                    hasPass: !!process.env.EMAIL_PASSWORD
                });
                contactMessage.status = 'email_error';
                // Don't throw error here, we still want to save the message
            }
        } else {
            console.log('Email not configured - skipping email sending');
            contactMessage.status = 'saved_no_email';
        }
        
        res.json({ 
            message: 'Thank you for your message! We will get back to you soon.',
            contactMessage
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            message: 'Error processing your request',
            error: error.message 
        });
    }
});

// Get all contact messages (admin only)
router.get('/messages', (req, res) => {
    // In a real application, you would add authentication middleware here
    res.json({ 
        message: 'Successfully retrieved contact messages',
        messages: contactMessages 
    });
});

module.exports = router;