import Notification from '../models/Notification.js';

// @desc    Get notifications for logged in user (filtered by role or explicit ID)
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    try {
        const userRole = req.user.role.toLowerCase();
        
        // Find notifications where targetRoles includes 'all' OR user's role
        // AND (targetUser is null OR targetUser matches req.user._id)
        const notifications = await Notification.find({
            $and: [
                {
                    $or: [
                        { targetRoles: { $in: ['all', userRole] } },
                    ]
                },
                {
                    $or: [
                        { targetUser: { $exists: false } },
                        { targetUser: null },
                        { targetUser: req.user._id }
                    ]
                }
            ]
        }).sort({ createdAt: -1 }).limit(50); // Get latest 50

        // Map read status based on readBy array
        const mappedNotifications = notifications.map(notif => {
            const isRead = notif.readBy.some(id => id.toString() === req.user._id.toString());
            return {
                id: notif._id,
                message: notif.message,
                roles: notif.targetRoles,
                read: isRead,
                date: notif.createdAt
            };
        });

        res.status(200).json({ success: true, data: mappedNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
    }
};

// @desc    Create a new notification (Internal use generally, but exposed if needed)
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
    try {
        const { message, targetRoles, targetUser } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const notification = await Notification.create({
            message,
            targetRoles: targetRoles || ['all'],
            targetUser: targetUser || null,
            readBy: []
        });

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ success: false, message: 'Server error creating notification' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Add user to readBy array if not already present
        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const userRole = req.user.role.toLowerCase();
        
        // Find all unread relevant notifications
        const unreadNotifications = await Notification.find({
            $and: [
                { targetRoles: { $in: ['all', userRole] } },
                { readBy: { $ne: req.user._id } },
                {
                    $or: [
                        { targetUser: { $exists: false } },
                        { targetUser: null },
                        { targetUser: req.user._id }
                    ]
                }
            ]
        });

        // Add user ID to readBy for all found
        await Promise.all(unreadNotifications.map(async (notif) => {
            notif.readBy.push(req.user._id);
            return await notif.save();
        }));

        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export { getMyNotifications, createNotification, markAsRead, markAllAsRead };
