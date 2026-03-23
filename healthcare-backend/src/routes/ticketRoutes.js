import express from 'express';
import { createTicket, getMyTickets, getAllTickets, resolveTicket } from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('PATIENT', 'HOSPITAL'), createTicket)
    .get(protect, authorize('INSURANCE', 'ADMIN', 'HOSPITAL'), getAllTickets);

router.route('/my')
    .get(protect, authorize('PATIENT', 'HOSPITAL'), getMyTickets);

router.route('/:id/resolve')
    .put(protect, authorize('INSURANCE', 'ADMIN'), resolveTicket);

export default router;
