import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';

const ChatWidget = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hi! I\'m MediConnect Assistant. How can I help you today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Hide chat widget for doctors and pharmacists
    const shouldShowChat = () => {
        // Check if on doctor or pharmacist dashboard
        if (location.pathname.includes('/dashboard/doctor') ||
            location.pathname.includes('/dashboard/pharmacist')) {
            return false;
        }
        // If user is logged in, check their role
        if (user && (user.role === 'doctor' || user.role === 'pharmacist')) {
            return false;
        }
        return true;
    };

    // Don't render chatbot for doctors and pharmacists
    if (!shouldShowChat()) {
        return null;
    }

    // Quick action buttons
    const quickActions = [
        { icon: '📅', text: 'Book Appointment', action: 'appointment' },
        { icon: '💊', text: 'Order Medicines', action: 'medicines' },
        { icon: '📄', text: 'Upload Prescription', action: 'prescription' },
        { icon: '❓', text: 'FAQ', action: 'faq' }
    ];

    // Simulate AI response (replace with actual AI API call)
    const getAIResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        // Simple keyword-based responses (replace with actual AI)
        if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
            return 'I can help you book an appointment! You can visit our "Find Doctors" page to search for available doctors and book your appointment. Would you like me to guide you through the process?';
        } else if (lowerMessage.includes('medicine') || lowerMessage.includes('pharmacy')) {
            return 'You can order medicines from our Pharmacy section. Just search for the medicine you need or upload your prescription, and we\'ll deliver it to you. Need help with that?';
        } else if (lowerMessage.includes('prescription')) {
            return 'To upload a prescription, go to the "Upload Prescription" section in your dashboard. Make sure your prescription is clear and includes doctor\'s signature, patient name, and date. Our pharmacist will review it within 24 hours.';
        } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
            return 'We accept various payment methods including credit/debit cards, UPI, and net banking. Your payment information is encrypted and secure. Is there a specific payment issue you\'re facing?';
        } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
            return 'You can cancel appointments up to 2 hours before the scheduled time. For medicine orders, cancellation is possible before the pharmacist reviews your prescription. Refunds are processed within 5-7 business days.';
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Hello! How can I assist you today? I can help with appointments, medicine orders, prescriptions, and general queries.';
        } else {
            return 'I understand you need help with that. For detailed assistance, you can:\n\n• Check our FAQ section\n• Contact our support team at support@mediconnect.com\n• Call us at 1-800-MEDICONNECT\n\nIs there anything specific I can help you with?';
        }
    };

    const handleQuickAction = (action) => {
        let message = '';
        switch (action) {
            case 'appointment':
                message = 'I want to book an appointment';
                break;
            case 'medicines':
                message = 'I need to order medicines';
                break;
            case 'prescription':
                message = 'How do I upload a prescription?';
                break;
            case 'faq':
                message = 'Show me frequently asked questions';
                break;
            default:
                return;
        }
        handleSendMessage(message);
    };

    const handleSendMessage = (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        // Add user message
        const userMessage = {
            type: 'user',
            text: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const botResponse = {
                type: 'bot',
                text: getAIResponse(messageText),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Widget Button */}
            <div
                className={`chat-widget-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Chat with AI Assistant"
            >
                {isOpen ? '✕' : '💬'}
                {!isOpen && <span className="chat-badge">AI</span>}
            </div>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chat-widget-panel">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">🤖</div>
                            <div>
                                <div className="chat-title">MediConnect Assistant</div>
                                <div className="chat-status">
                                    <span className="status-dot"></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="chat-quick-actions">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="quick-action-btn"
                                onClick={() => handleQuickAction(action.action)}
                            >
                                <span className="action-icon">{action.icon}</span>
                                <span className="action-text">{action.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.type}`}>
                                {message.type === 'bot' && (
                                    <div className="message-avatar">🤖</div>
                                )}
                                <div className="message-content">
                                    <div className="message-text">{message.text}</div>
                                    <div className="message-time">{message.time}</div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content typing">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-container">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim()}
                        >
                            ➤
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="chat-footer">
                        Powered by MediConnect AI
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
