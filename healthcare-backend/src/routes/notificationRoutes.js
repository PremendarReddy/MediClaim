import express from 'express';
import { getMyNotifications, createNotification, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMyNotifications)
    .post(protect, createNotification); // In a fully secure app, post might be internal only, but letting authenticated users generate custom alerts is okay for this prototype.

router.route('/read-all')
    .put(protect, markAllAsRead);

router.route('/:id/read')
    .put(protect, markAsRead);

export default router;
