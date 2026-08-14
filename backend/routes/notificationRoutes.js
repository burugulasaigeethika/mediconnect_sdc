const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/notifications - Get all notifications for logged-in user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await Notification.countDocuments({ userId, isRead: false });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Error fetching unread count' });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
    try {
        const userId = req.user.userId;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const notification = await Notification.findOneAndDelete({ _id: id, userId });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

module.exports = router;
