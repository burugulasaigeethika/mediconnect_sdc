const User = require('../models/User');
const Notification = require('../models/Notification');

// Send notification to patient
exports.sendPatientNotification = async (patientId, title, message, type = 'info') => {
    try {
        // Create notification in database
        const notification = new Notification({
            user: patientId,
            title,
            message,
            type
        });
        
        await notification.save();
        
        // Emit socket event if io is available
        const io = require('../server').get('io');
        if (io) {
            io.to(patientId.toString()).emit('notification', {
                ...notification.toObject(),
                createdAt: notification.createdAt.toISOString()
            });
        }
        
        return notification;
    } catch (error) {
        console.error('Error sending patient notification:', error);
        throw error;
    }
};

// Send order status update notification
exports.sendOrderStatusNotification = async (orderId, patientId, status, additionalMessage = '') => {
    try {
        let title = '';
        let message = '';
        let type = 'info';
        
        switch (status) {
            case 'Approved':
                title = 'Order Approved';
                message = `Your prescription order #${orderId} has been approved by the pharmacist.`;
                type = 'success';
                break;
            case 'Rejected':
                title = 'Order Rejected';
                message = `Your prescription order #${orderId} has been rejected by the pharmacist. ${additionalMessage}`;
                type = 'error';
                break;
            case 'Processing':
                title = 'Order Processing';
                message = `Your prescription order #${orderId} is now being processed.`;
                type = 'info';
                break;
            case 'Ready for Dispatch':
                title = 'Order Ready for Dispatch';
                message = `Your prescription order #${orderId} is ready for pickup/delivery.`;
                type = 'success';
                break;
            case 'Completed':
                title = 'Order Completed';
                message = `Your prescription order #${orderId} has been completed.`;
                type = 'success';
                break;
            default:
                title = 'Order Status Updated';
                message = `Your prescription order #${orderId} status has been updated to ${status}.`;
        }
        
        return await this.sendPatientNotification(patientId, title, message, type);
    } catch (error) {
        console.error('Error sending order status notification:', error);
        throw error;
    }
};